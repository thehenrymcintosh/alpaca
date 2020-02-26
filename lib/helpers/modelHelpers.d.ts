declare const AlpacaArray: any, AlpacaDate: any, AlpacaType: any;
declare const validators: any;
declare const primitiveToString: (primitive: any) => any;
declare const extractType: (mixedInput: any) => {
    isAlpacaArray: boolean;
    type: any;
    rawObject: any;
    typeOrArray: any;
} | undefined;
