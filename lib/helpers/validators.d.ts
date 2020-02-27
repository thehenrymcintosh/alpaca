declare function isValidName(name: any): boolean;
declare function isValidFunction(func: any): boolean;
declare function isValidText(text: any): boolean;
declare function isValidBool(bool: any): boolean;
declare function isValidDate(date: any): boolean;
declare function isValidEmail(email: any): boolean;
declare function isValidArray(arr: any): boolean;
declare function isValidIdString(testId: any): boolean;
declare function isValidObject(obj: any): boolean;
declare function isValidId(testId: any): boolean;
declare function isValidUrl(url: any): boolean;
declare function isValidInt(num: any): boolean;
declare function isValidNumber(num: any): boolean;
declare function findInvalidIds(ids: any): any[];
declare function getValidateMethodForType(type: string): typeof isValidName;
declare const _default: {
    isValidArray: typeof isValidArray;
    isValidBool: typeof isValidBool;
    isValidDate: typeof isValidDate;
    isValidEmail: typeof isValidEmail;
    isValidIdString: typeof isValidIdString;
    isValidId: typeof isValidId;
    isValidInt: typeof isValidInt;
    isValidName: typeof isValidName;
    isValidNumber: typeof isValidNumber;
    isValidUrl: typeof isValidUrl;
    isValidText: typeof isValidText;
    isValidObject: typeof isValidObject;
    getValidateMethodForType: typeof getValidateMethodForType;
    findInvalidIds: typeof findInvalidIds;
    isValidFunction: typeof isValidFunction;
};
export default _default;