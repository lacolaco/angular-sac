import { ApplicationRef, ComponentRef, createComponent, Type } from "@angular/core";
import { createApplication } from "@angular/platform-browser";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

type AnyComponentRef = ComponentRef<unknown>;

type ApplicationRefResolver = Promise<ApplicationRef> | ApplicationRef;

export const AngularContext = createContext<ApplicationRefResolver>(createApplication());

export type ReactifyProps = {
  component: Type<unknown>;
  inputs?: Record<string, unknown>;
};

export const Reactify: React.FunctionComponent<ReactifyProps> = ({ component, inputs = {} }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const [appRef, setAppRef] = useState<ApplicationRef | null>(null);
  const [compRef, setCompRef] = useState<AnyComponentRef | null>(null);

  Promise.resolve(useContext(AngularContext)).then(setAppRef);

  useEffect(() => {
    if (appRef && hostRef.current) {
      setCompRef(createComponent(component, { environmentInjector: appRef.injector, hostElement: hostRef.current }));
    }
    return () => compRef?.destroy();
  }, [hostRef, appRef, component]);

  useEffect(() => {
    if (compRef) {
      for (const [key, value] of Object.entries(inputs)) {
        compRef.setInput(key, value);
      }
      compRef.changeDetectorRef.detectChanges();
    }
  }, [compRef, inputs]);

  return <div ref={hostRef} />;
};
