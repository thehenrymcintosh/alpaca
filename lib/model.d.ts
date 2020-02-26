declare const mongoose: any;
declare const express: any;
declare const primitiveToString: any, extractType: any;
declare const AlpacaArray: any, AlpacaDate: any, AlpacaType: any;
declare const validators: any;
declare const fileHandler: any;
declare const fs: any;
declare const path: any;
declare const compile: any;
declare const GlobalModelStore: {};
declare const LastModified: any;
declare const CreatedAt: any;
declare function getModelByName(name: any): any;
declare class AlpacaModel {
    constructor(name: any, props: any, options?: {});
    generateRouter(): void;
    pushNestedRoute(method: any, path: any, middleware: any): void;
    generateMongoose(): void;
    getOpenApiProperties(): {
        title: any;
        properties: {};
    };
    generateOpenApi(newOptions: any): void;
    getTsProperties(): {
        title: any;
        type: string;
        properties: {};
    };
    generateTs(newOptions: any): void;
    cast(body?: {}): {};
    validate(body: any): void;
    getAlpacaMountMiddleware(): (req: any, res: any, next: any) => void;
    read(req: any, res: any, next: any): void;
    index(req: any, res: any, next: any): void;
    create(req: any, res: any, next: any): void;
    update(req: any, res: any, next: any): void;
    destroy(req: any, res: any, next: any): void;
}
