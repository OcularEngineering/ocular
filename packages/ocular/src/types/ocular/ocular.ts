import { OcularFactory } from "./interface";


export interface RegisterOcularParameters {
  schedule: string;
  /**
   * The class responsible for returning the document ocular of the given type.
   */
  factory: OcularFactory;
}