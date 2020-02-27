import { Schema } from "mongoose";


export type AlapacaPrimitive = StringConstructor | NumberConstructor | DateConstructor | typeof Schema.Types.ObjectId;
export type AlpacaValidator = ((value: any) => boolean);
export type AlpacaCaster = ((value: any) => any)
export interface AlpacaTypeOptions {
  primitive?: AlapacaPrimitive
  null_or_non_empty_trimmed_string?: boolean
  validate?: AlpacaValidator | AlpacaValidator[]
  cast?: AlpacaCaster | AlpacaCaster[]
}