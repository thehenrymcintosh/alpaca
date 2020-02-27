import { Schema } from "mongoose";
export declare type AlapacaPrimitive = StringConstructor | NumberConstructor | DateConstructor | typeof Schema.Types.ObjectId;
export declare type AlpacaValidator = ((value: any) => boolean);
export declare type AlpacaCaster = ((value: any) => any);
export interface AlpacaTypeOptions {
    primitive?: AlapacaPrimitive;
    null_or_non_empty_trimmed_string?: boolean;
    validate?: AlpacaValidator | AlpacaValidator[];
    cast?: AlpacaCaster | AlpacaCaster[];
}
