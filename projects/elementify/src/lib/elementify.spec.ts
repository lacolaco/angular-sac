import { Component, inject, InjectionToken, Input } from '@angular/core';
import { createApplication } from '@angular/platform-browser';
import { screen, waitFor } from '@testing-library/dom';
import { elementify } from './elementify';

let uniqueId = 0;

describe('elementify', () => {
  let tagName: string;
  let container: HTMLElement;

  beforeEach(() => {
    tagName = `test-element${uniqueId++}`;
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('should render a standalone Angular component', async () => {
    @Component({
      template: `<div>TEST</div>`,
      standalone: true,
    })
    class TestComp {}

    const TestElement = await elementify(TestComp);
    window.customElements.define(tagName, TestElement);
    container.innerHTML = `<${tagName}></${tagName}>`;

    await waitFor(() => {
      expect(screen.getByText('TEST')).toBeTruthy();
    });
  });

  it('should render a standalone Angular component with inputs', async () => {
    @Component({
      template: `<div>{{ a }}-{{ b }}</div>`,
      standalone: true,
    })
    class TestComp {
      @Input() a = '';
      @Input() b = '';
    }

    const TestElement = await elementify(TestComp);
    window.customElements.define(tagName, TestElement);
    container.innerHTML = `<${tagName} a="foo" b="bar"></${tagName}>`;

    await waitFor(() => {
      expect(screen.getByText('foo-bar')).toBeTruthy();
    });
  });

  it('should render a standalone Angular component with an application context', async () => {
    const token = new InjectionToken<string>('token');
    @Component({
      template: `<div>{{ a }}-{{ b }}-{{ c }}</div>`,
      standalone: true,
    })
    class TestComp {
      @Input() a = '';
      @Input() b = '';
      c = inject(token);
    }

    const appRef = await createApplication({
      providers: [{ provide: token, useValue: 'baz' }],
    });

    const TestElement = await elementify(TestComp, { appRef });
    window.customElements.define(tagName, TestElement);
    container.innerHTML = `<${tagName} a="foo" b="bar"></${tagName}>`;

    await waitFor(() => {
      expect(screen.getByText('foo-bar-baz')).toBeTruthy();
    });
  });
});
