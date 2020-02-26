declare const AlpacaType: any;
declare const defaultOptions: {
    allowNullInArray: boolean;
};
declare class AlpacaArray {
    constructor(props: any, options?: {
        allowNullInArray: boolean;
    });
    cast(arrayOfValues: any): any[];
    validate(arrayOfValues: any): boolean;
}
