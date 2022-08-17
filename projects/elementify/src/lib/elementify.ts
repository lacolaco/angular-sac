import { ApplicationRef, Type } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';

export const elementify = async (component: Type<unknown>, options?: { appRef?: ApplicationRef }): Promise<CustomElementConstructor> => {
  const appRef = options?.appRef ?? (await createApplication());
  return createCustomElement(component, { injector: appRef.injector });
};
