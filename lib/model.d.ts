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
export default AlpacaModel;
