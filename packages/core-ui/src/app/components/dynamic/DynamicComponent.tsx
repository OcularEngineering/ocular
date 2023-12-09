import {useFederatedComponent} from "@autoflow-ai/core";
import * as React from "react";

export const DynamicComponent = ({url,scope,module}: { url:string, scope: string, module:string }) => {
  const {Component: DynComponent} = useFederatedComponent(url, scope, module);
  return DynComponent && <DynComponent/>;
};