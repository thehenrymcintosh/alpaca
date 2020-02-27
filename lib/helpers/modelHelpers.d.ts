import { AlpacaArray, AlpacaType } from "../types/_index";
import { AlapacaPrimitive, AlpacaModelProp } from "../types/tsdefs";
export declare const primitiveToString: (primitive: AlapacaPrimitive) => string;
interface extractedType {
    isAlpacaArray: boolean;
    rawObject: null | AlpacaModelProp;
    type: AlpacaType;
    typeOrArray: AlpacaType | AlpacaArray;
}
export declare const extractType: (mixedInput: AlpacaArray | AlpacaType | AlpacaModelProp) => extractedType;
export {};
