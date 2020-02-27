import { AlpacaArray, AlpacaType } from "../types/_index";
import { AlapacaPrimitive } from "../types/tsdefs";
declare type ArrayOrType = AlpacaType | AlpacaArray;
interface modelProp {
    type: ArrayOrType;
    [k: string]: any;
}
declare const _default: {
    primitiveToString: (primitive: AlapacaPrimitive) => string;
    extractType: (mixedInput: AlpacaType | AlpacaArray | modelProp) => {
        isAlpacaArray: boolean;
        type: AlpacaType;
        rawObject: null;
        typeOrArray: AlpacaType;
    } | {
        isAlpacaArray: boolean;
        type: AlpacaType;
        rawObject: null;
        typeOrArray: AlpacaArray;
    } | {
        isAlpacaArray: boolean;
        type: AlpacaType;
        rawObject: modelProp;
        typeOrArray: AlpacaType;
    } | {
        isAlpacaArray: boolean;
        type: AlpacaType;
        rawObject: modelProp;
        typeOrArray: AlpacaArray;
    } | undefined;
};
export = _default;
