import { Schema } from "mongoose";
import AlpacaArray from "./array";
import AlpacaType from "./type";

export type AlapacaPrimitive = StringConstructor | NumberConstructor | DateConstructor | typeof Schema.Types.ObjectId;
export type AlpacaValidator = ((value: any) => boolean);
export type AlpacaCaster = ((value: any) => any)
export interface AlpacaTypeOptions {
  primitive?: AlapacaPrimitive
  null_or_non_empty_trimmed_string?: boolean
  validate?: AlpacaValidator | AlpacaValidator[]
  cast?: AlpacaCaster | AlpacaCaster[]
}

export interface AlpacaModelProp {
  type: AlpacaType | AlpacaArray
  ref?: string
  populate?: boolean
  required?: boolean
  readOnly?: boolean
  example?: any
  description?: string
  enum?: any[]
}


export interface AlpacaModelTSOptions {
  dir: string
  filePath?: string
  additionalProperties?: boolean
}

export interface AlpacaModelOpenAPIOptions {
  dir: string
  filePath?: string
  tags?: string[]
}
export interface AlpacaNestedRestOptions {
  path: string
  foreignField: string
  modelName: string
}

export interface AlpacaModelOptions {
  manualInit?: boolean;
  generateTs?: AlpacaModelTSOptions;
  generateOpenApi?: AlpacaModelOpenAPIOptions;
  nestedRest?:AlpacaNestedRestOptions[];
  timestamps?: boolean;
}