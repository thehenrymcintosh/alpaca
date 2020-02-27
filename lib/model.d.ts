import { SchemaDefinition, Model, Document } from "mongoose";
import { Router, Request, Response, NextFunction } from "express";
import { AlpacaArray, AlpacaType } from "./types/_index";
import { AlpacaModelProp, AlpacaModelOptions, AlpacaModelOpenAPIOptions, AlpacaModelTSOptions } from "./types/tsdefs";
interface AlpacaMongooseDocument extends Document {
}
declare module 'express-serve-static-core' {
    interface Request {
        alpaca?: AlpacaModel;
    }
}
declare type middleware = ((req: Request, res: Response, next: NextFunction) => void | never);
declare type anyObject = ({
    [k: string]: any;
});
declare type nestedRouteAllowedMethods = "get" | "put" | "post" | "delete" | "use";
interface nestedRoute {
    method: nestedRouteAllowedMethods;
    path: string;
    middleware: middleware;
}
declare class AlpacaModel {
    constructor(name: string, props: ({
        [k: string]: AlpacaModelProp | AlpacaArray | AlpacaType;
    }), options?: AlpacaModelOptions);
    name: string;
    populators: string[];
    locals_name: string;
    id_name: string;
    raw_model: ({
        [k: string]: AlpacaModelProp | AlpacaArray | AlpacaType;
    });
    mongooseTemplate: SchemaDefinition;
    model: Model<AlpacaMongooseDocument> | undefined;
    options: AlpacaModelOptions;
    router?: Router;
    nestedRoutes: nestedRoute[];
    generateRouter(): void;
    pushNestedRoute(method: nestedRouteAllowedMethods, path: string, middleware: middleware): void;
    generateMongoose(): void;
    getOpenApiProperties(): {
        title: string;
        properties: anyObject;
        required: string[];
        tags: string[];
    };
    generateOpenApi(newOptions?: AlpacaModelOpenAPIOptions): void;
    getTsProperties(): {
        title: string;
        type: string;
        properties: anyObject;
        additionalProperties: boolean;
        required: string[];
    };
    generateTs(newOptions?: AlpacaModelTSOptions): void;
    cast(body?: anyObject): anyObject;
    validate(body: anyObject): void;
    getAlpacaMountMiddleware: (this: AlpacaModel) => middleware;
    read: middleware;
    index: middleware;
    create: middleware;
    update: middleware;
    destroy: middleware;
}
export default AlpacaModel;
