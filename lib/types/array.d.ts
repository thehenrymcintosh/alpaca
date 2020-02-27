import AlpacaType from "./type";
interface AlpacaArrayOptions {
    allowNullInArray: boolean;
}
declare class AlpacaArray {
    constructor(props: AlpacaType, options?: AlpacaArrayOptions);
    options: AlpacaArrayOptions;
    type: AlpacaType;
    cast(arrayOfValues: any[]): any[];
    validate(arrayOfValues: any[]): boolean;
}
export default AlpacaArray;
