import { AlpacaArray, AlpacaType } from "../types/_index";
import { AlapacaPrimitive, AlpacaModelProp } from "../types/tsdefs";
export declare const primitiveToString: (primitive: AlapacaPrimitive) => string;
export declare const getTypeDefObject: (primitive: AlapacaPrimitive) => {
    type: string;
    tsType: string;
} | {
    type: string;
    tsType?: undefined;
} | undefined;
interface extractedType {
    isAlpacaArray: boolean;
    rawObject: null | AlpacaModelProp;
    type: AlpacaType;
    typeOrArray: AlpacaType | AlpacaArray;
}
export declare const extractType: (mixedInput: AlpacaArray | AlpacaType | AlpacaModelProp) => extractedType;
export {};
