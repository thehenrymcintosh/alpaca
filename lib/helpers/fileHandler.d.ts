declare const _default: {
    storeData: (path: string, data: any, isJson: boolean) => void;
    loadData: (path: string, isJson: boolean) => any;
    saveIfChanged: (filePath: string, toWrite: any, isJson: boolean) => void;
};
export = _default;
