import { Component, inject, InjectionToken, Input } from "@angular/core";
import { createApplication } from "@angular/platform-browser";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { AngularContext, Reactify } from "./reactify";

describe("Reactify", () => {
  it("should render a standalone Angular component", async () => {
    @Component({
      template: `<div>TEST</div>`,
      standalone: true,
    })
    class TestComp {}

    const appRef = await createApplication();

    render(<Reactify component={TestComp} />);

    await waitFor(() => {
      expect(screen.getByText("TEST")).toBeTruthy();
    });
  });

  it("should render a standalone Angular component with inputs", async () => {
    @Component({
      template: `<div>{{ a }}-{{ b }}</div>`,
      standalone: true,
    })
    class TestComp {
      @Input() a = "";
      @Input() b = "";
    }

    const appRef = await createApplication();

    render(<Reactify component={TestComp} inputs={{ a: "foo", b: "bar" }} />);

    await waitFor(() => {
      expect(screen.getByText("foo-bar")).toBeTruthy();
    });
  });

  it("should render a standalone Angular component with an application context", async () => {
    const token = new InjectionToken<string>("token");
    @Component({
      template: `<div>{{ a }}-{{ b }}-{{ c }}</div>`,
      standalone: true,
    })
    class TestComp {
      @Input() a = "";
      @Input() b = "";
      c = inject(token);
    }

    const appRef = await createApplication({
      providers: [{ provide: token, useValue: "baz" }],
    });

    render(
      <AngularContext.Provider value={() => appRef}>
        <Reactify component={TestComp} inputs={{ a: "foo", b: "bar" }} />
      </AngularContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("foo-bar-baz")).toBeTruthy();
    });
  });
});
