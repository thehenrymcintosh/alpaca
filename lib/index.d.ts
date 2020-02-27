import Model from "./model";
declare const _default: {
    AlpacaModel: typeof Model;
    AlpacaTypes: {
        AlpacaString: typeof import("./types/string").default;
        AlpacaInt: typeof import("./types/int").default;
        AlpacaReference: typeof import("./types/ref").default;
        AlpacaArray: typeof import("./types/array").default;
        AlpacaDate: typeof import("./types/date").default;
        AlpacaType: typeof import("./types/type").default;
    };
    AlpacaValidators: {
        isValidArray: (arr: any) => boolean;
        isValidBool: (bool: any) => boolean;
        isValidDate: (date: any) => boolean;
        isValidEmail: (email: any) => boolean;
        isValidIdString: (testId: any) => boolean;
        isValidId: (testId: any) => boolean;
        isValidInt: (num: any) => boolean;
        isValidName: (name: any) => boolean;
        isValidNumber: (num: any) => boolean;
        isValidUrl: (url: any) => boolean;
        isValidText: (text: any) => boolean;
        isValidObject: (obj: any) => boolean;
        getValidateMethodForType: (type: string) => (name: any) => boolean;
        findInvalidIds: (ids: any) => any[];
        isValidFunction: (func: any) => boolean;
    };
};
export = _default;
