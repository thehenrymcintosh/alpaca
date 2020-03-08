import { Schema, model, SchemaDefinition, Model, Document } from "mongoose";
import { Router, Request, Response, NextFunction } from "express";

import { primitiveToString, extractType, getTypeDefObject } from "./helpers/modelHelpers";

import { AlpacaArray, AlpacaDate, AlpacaType, AlpacaReference } from "./types/_index";
import { AlpacaModelProp, AlpacaModelOptions, AlpacaModelOpenAPIOptions, AlpacaModelTSOptions } from "./types/tsdefs";

import validators from "./helpers/validators";
import { saveIfChanged } from "./helpers/fileHandler";

const fs = require('fs');
const path = require("path");
const { compile } = require('json-schema-to-typescript');

const GlobalModelStore : ({ [key: string]: AlpacaModel }) = {};

const RODate = new AlpacaDate();

interface AlpacaMongooseDocument extends Document {
}
declare module 'express-serve-static-core' {
  export interface Request {
    alpaca?: AlpacaModel,
  }
}
type middleware = (( req:Request, res:Response, next:NextFunction ) => void | never)
type anyObject = ({ [k:string]: any });
type nestedRouteAllowedMethods = "get"|"put"|"post"|"delete"|"use";
interface nestedRoute { 
  method:nestedRouteAllowedMethods, 
  path:string, 
  middleware:middleware 
}

function getModelByName( name : string ) {
  const model = GlobalModelStore[ name.toLowerCase() ];
  if ( model ) return model;
  return null;
}

class AlpacaModel {
  constructor( name : string, props: ({ [k: string] : AlpacaModelProp | AlpacaArray | AlpacaType }), options:AlpacaModelOptions = {}) {
    if ( getModelByName( name ) ) throw new Error("Model names must be unique!");
    this.name = name;
    if ( name.indexOf(" ") >= 0 ) throw new Error("Model names cannot contain spaces! '" + name +"'");
    this.locals_name = name.toLowerCase();
    this.id_name = name.toLowerCase() + "_id";
    this.raw_model = {
      ...props,
    }
    this.options = options;

    // @todo add mongoose options to pass to schema
    this.populators = [];
    this.nestedRoutes = [];
    if ( this.options.generateOpenApi ) {
      this.generateOpenApi();
    }
    if ( this.options.generateTs ) {
      this.generateTs();
    }
    if ( !this.options.manualInit ) {
      this.generateMongoose();
      this.generateRouter();
    }
    this.getAlpacaMountMiddleware = this.getAlpacaMountMiddleware.bind(this);
    GlobalModelStore[ name.toLowerCase() ] = this;
  }

  name: string;
  populators: string[];
  locals_name: string;
  id_name: string;
  raw_model: ({ [k: string] : AlpacaModelProp | AlpacaArray | AlpacaType })
  mongooseTemplate: SchemaDefinition = {};
  model: Model<AlpacaMongooseDocument> | undefined;
  options: AlpacaModelOptions = {};
  router?: Router;
  nestedRoutes: nestedRoute[]= [];

  generateRouter() {
    const alpaca = this;
    const router = Router();
    const alpacaMountMiddleware = this.getAlpacaMountMiddleware();

    router.use( alpacaMountMiddleware )
    router.get("/", alpaca.index );
    router.get(`/:${this.id_name}`, alpaca.read );
    router.post(`/`, alpaca.create );
    router.post(`/:${this.id_name}`, alpaca.update );
    router.delete(`/:${this.id_name}`, alpaca.destroy );
    if ( typeof this.options.nestedRest !== "undefined" && validators.isValidArray( this.options.nestedRest ) ) {
      this.options.nestedRest.forEach( route => {
        router.get(`/:${this.id_name}/${route.path}`, ( req, res, next ) => {
          const query:anyObject = {};
          const id = req.params[ this.id_name ];
          query[`${route.foreignField}`] = id;
          if ( !validators.isValidIdString( id ) ) throw new Error(`Invalid id: ${ id }`);
          const foreignModel = getModelByName(route.modelName);
          if ( foreignModel === null ) throw new Error("No foreign model");
          if ( typeof foreignModel.model === "undefined" ) throw new Error("No initalized foreign model");
          foreignModel.model.find(query)
            .populate( foreignModel.populators.join(" ") )
            .exec()
            .then( ( docs ) => {
              res.locals[route.modelName.toLowerCase() + "s"] = docs;
              next();
            } )
            .catch( next );
          } );
      })
    }
    this.nestedRoutes.forEach( route => {
      router[ route.method ]( `/:${this.id_name}/${route.path}`, route.middleware );
    })
    this.router = router;
  }

  pushNestedRoute( method:nestedRouteAllowedMethods, path:string, middleware:middleware ) {
    const allowedMethods = ["get","put","post","delete","use"]
    if ( !validators.isValidName( method ) ) throw new Error("Method must be valid text");
    if ( allowedMethods.indexOf( method ) === -1 ) throw new Error("Method must be one of: " + allowedMethods.join(" ") );
    if ( !validators.isValidName( path ) ) throw new Error("Path must be valid text");
    if ( path.charAt(0) === "/" ) throw new Error("Path should not start with /");
    if ( !validators.isValidFunction( middleware ) && !validators.isValidArray( middleware ) ) throw new Error("Middleware should be a function or array of functions");
    this.nestedRoutes.push({
      method, 
      path,
      middleware,
    });
    this.generateRouter();
  }

  generateMongoose() {
    const modelKeys = Object.keys( this.raw_model );
    this.mongooseTemplate ;
    const alpaca = this;
    modelKeys.forEach( modelKey => {
      const modelValue = this.raw_model[ modelKey ];
      const { rawObject, isAlpacaArray, type } = extractType(modelValue);
      const newMongooseProp:anyObject = { required: true };

      newMongooseProp.type = type.primitive;
      if ( rawObject ) {
        if ( rawObject.ref ) newMongooseProp.ref = rawObject.ref;
        if ( rawObject.populate && rawObject.ref ) alpaca.populators.push( modelKey );
        if ( validators.isValidBool( rawObject.required ) ) newMongooseProp.required = rawObject.required;
      }
      if ( isAlpacaArray ) {
        this.mongooseTemplate[ modelKey ] = [newMongooseProp];
      } else {
        this.mongooseTemplate[ modelKey ] = newMongooseProp;
      }
    } )
    const schemaOptions: anyObject = {};
    if ( typeof alpaca.options.timestamps === "boolean" ){
      schemaOptions.timestamps = alpaca.options.timestamps;
    }

    const schema = new Schema( this.mongooseTemplate, schemaOptions );
    if ( this.options.schemaCallback && validators.isValidFunction( this.options.schemaCallback ) ) {
      this.options.schemaCallback( schema );
    }
    this.model = new (model as any)( this.name, schema );
  }


  getOpenApiProperties() {
    const toWrite = {
      title: this.name,
      properties: {} as anyObject,
      required: [] as string[],
      tags: [] as string[],
    }
    const required: string[] = ["_id"];
    const modelKeys = Object.keys( this.raw_model );
    modelKeys.forEach( modelKey => {
      const modelValue = this.raw_model[ modelKey ];
      const { rawObject, type, isAlpacaArray } = extractType(modelValue);
      let isRequired = true;
      if ( rawObject && typeof rawObject.required === "boolean" ) isRequired = rawObject.required;
      if ( rawObject && rawObject.populate && rawObject.ref && validators.isValidName(rawObject.ref) && getModelByName(rawObject.ref.toLowerCase()) ){
        const foreignModel = getModelByName(rawObject.ref);
        if ( foreignModel === null ) throw new Error("Foreign model does not exist");
        if ( isAlpacaArray ) {
          toWrite.properties[ modelKey ] = {items: foreignModel.getOpenApiProperties()};
        } else {
          toWrite.properties[ modelKey ] = foreignModel.getOpenApiProperties();
        }  
      } else {
        if ( isAlpacaArray ) {
          toWrite.properties[ modelKey ] = { items: { type: primitiveToString(type.primitive), } }
        } else {
          toWrite.properties[ modelKey ] = { type: primitiveToString(type.primitive), }
        }
      }
      if ( rawObject && typeof rawObject.example !== "undefined" ) toWrite.properties[ modelKey ].example = rawObject.example;
      if ( rawObject && typeof rawObject.readOnly !== "undefined" ) toWrite.properties[ modelKey ].readOnly = rawObject.readOnly;
      if ( isRequired ) required.push( modelKey );
    } );
    toWrite.properties._id = { type: "string", readOnly: true };
    if ( this.options.timestamps ) {
      toWrite.properties.updatedAt = { type: "date", readOnly: true };
      toWrite.properties.createdAt = { type: "date", readOnly: true };
      required.push("createdAt");
      required.push("updatedAt");
    }
    if ( required.length > 0 ) toWrite.required = required;
    return toWrite;
  }

  generateOpenApi( newOptions?:AlpacaModelOpenAPIOptions ) {
    if ( newOptions && validators.isValidObject( newOptions ) ) this.options.generateOpenApi = newOptions;
    if ( !this.options.generateOpenApi ) throw new Error("Openapi options are not set");

    const { dir, tags } = this.options.generateOpenApi;
    if ( !validators.isValidText( dir ) ) throw new Error( "'options.generateOpenApi.dir' must be a valid path string for the output directory!");
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true } );
    }
    const filePath = path.join(dir, `${this.name}.json`);
    this.options.generateOpenApi.filePath = filePath;
    
    const toWrite = this.getOpenApiProperties();
    if ( tags ) toWrite.tags = tags;

    saveIfChanged( filePath, toWrite, true );
  }

  // @todo fix infinite recursion of definitions with references
  getTsProperties(){
    if ( !this.options.generateTs) throw new Error("Typescript options are not set");

    const { additionalProperties } = this.options.generateTs;
    const required:string[] = ["_id"];
    const toWrite = {
      title: this.name,
      type: "object",
      properties: {} as anyObject,
      additionalProperties: false,
      required: [] as string[],
    }
    if ( typeof additionalProperties === "boolean" ) toWrite.additionalProperties = additionalProperties;
    const modelKeys = Object.keys( this.raw_model );
    modelKeys.forEach( modelKey => {
      const modelValue = this.raw_model[ modelKey ];
      const { isAlpacaArray, rawObject, type } = extractType(modelValue);
      let isRequired = true;
      if ( rawObject && typeof rawObject.required === "boolean" ) isRequired = rawObject.required;
      if ( rawObject && rawObject.populate && rawObject.ref && validators.isValidName(rawObject.ref) && getModelByName(rawObject.ref.toLowerCase()) ){
        const foreignModel = getModelByName(rawObject.ref);
        if ( foreignModel === null ) throw new Error("Foreign model does not exist");
        if ( isAlpacaArray ) {
          toWrite.properties[ modelKey ] = {items: foreignModel.getTsProperties()};
        } else {
          toWrite.properties[ modelKey ] = foreignModel.getTsProperties();
        }  
      } else {
        if ( isAlpacaArray ) {
          toWrite.properties[ modelKey ] = { items: getTypeDefObject(type.primitive) };
        } else {
          toWrite.properties[ modelKey ] = getTypeDefObject(type.primitive);
        }
      }
      if ( rawObject && rawObject.description ) toWrite.properties[ modelKey ].description = rawObject.description;
      if ( rawObject && rawObject.enum && validators.isValidArray( rawObject.enum ) ) toWrite.properties[ modelKey ].enum = rawObject.enum;
      if ( isRequired ) required.push( modelKey );
    } );
    toWrite.properties._id = { type: "string", readOnly: true };
    if ( this.options.timestamps ) {
      toWrite.properties.updatedAt = { type: 'object', tsType: 'Date', readOnly: true };
      toWrite.properties.createdAt = { type: 'object', tsType: 'Date', readOnly: true };
      required.push("createdAt");
      required.push("updatedAt");
    }
    if ( required.length > 0 ) toWrite.required = required;
    return toWrite;
  }

  generateTs( newOptions?:AlpacaModelTSOptions ) {
    if ( newOptions && validators.isValidObject( newOptions ) ) this.options.generateTs = newOptions;
    if ( !this.options.generateTs ) throw new Error("Typescript options are not");
    const { dir } = this.options.generateTs;
    if ( !validators.isValidText( dir ) ) throw new Error( "'options.generateTs.dir' must be a valid path string for the output directory!");
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true } );
    }
    const filePath = path.join(dir, `${this.name}.ts`);
    this.options.generateTs.filePath = filePath;
    const toWrite = this.getTsProperties();

    compile(toWrite, toWrite.title, {
      bannerComment: "/* tslint:disable */\n/**\n* This file was automatically generated by json-schema-to-typescript in Alpaca.\n* DO NOT MODIFY IT BY HAND. Instead, modify the Alpaca model and this will regenerate the next time the server starts.\n*/"	
    })
      .then( ( ts: string )=> {
        saveIfChanged( filePath, ts );
      })
  }

  cast( body:anyObject = {} ) {
    const modelKeys = Object.keys( this.raw_model );
    const newBody:anyObject = {};
    modelKeys.forEach( modelKey => {
      const modelValue = this.raw_model[ modelKey ];
      const { rawObject, typeOrArray } = extractType(modelValue);
      if ( !(rawObject && rawObject.readOnly) ){
        newBody[ modelKey ] = typeOrArray.cast( body[ modelKey ] );
      }
    } )
    return newBody;
  }

  validate( body:anyObject ) {
    const modelKeys = Object.keys( this.raw_model );
    modelKeys.forEach( modelKey => {
      const modelValue = this.raw_model[ modelKey ];
      const { rawObject, typeOrArray } = extractType(modelValue);
      if ( rawObject && rawObject.readOnly ){
        if ( typeof body[ modelKey ] !== "undefined" ) throw new Error(`${this.name} ${modelKey} is read-only`);
      } else {
        let required = true;
        if ( rawObject && typeof rawObject.required === "boolean" ) required = rawObject.required;
        if ( !typeOrArray.validate( body[ modelKey ] ) ) throw new Error(`Invalid ${this.name} ${modelKey}: ${ body[ modelKey ]}`);
        if ( !body[ modelKey ] && required ) throw new Error(`${this.name} ${modelKey} is required`);
      }
    } )
  }

  getAlpacaMountMiddleware = function (this:AlpacaModel): middleware {
    const alpaca = this;
    return ( req, res, next ) => {
      req.alpaca = alpaca;
      next();
    }
  }
  read: middleware = function( req, res, next ) {
    const { alpaca } = req;
    if ( !alpaca || typeof alpaca.model === "undefined" ) throw new Error("Alpaca model not initialised");
    const id = req.params[ alpaca.id_name ];
    if ( !validators.isValidIdString( id ) ) throw new Error(`Invalid id: ${ id }`);

    alpaca.model.findById( id )
    .populate( alpaca.populators.join(" ") )
    .exec()
    .then( ( doc ) => {
      res.locals[alpaca.locals_name] = doc;
      next();
    } )
    .catch( next );
  }

  
  index: middleware = function( req, res, next ) {
    const { alpaca } = req;
    if ( !alpaca || typeof alpaca.model === "undefined" ) throw new Error("Alpaca model not initialised");

    alpaca.model.find()
    .populate( alpaca.populators.join(" ") )
    .exec()
    .then( ( docs ) => {
      res.locals[alpaca.locals_name + "s"] = docs;
      next();
    } )
    .catch( next );
  }

  create: middleware = function( req, res, next ) {
    const { alpaca } = req;
    if ( !alpaca || typeof alpaca.model === "undefined" ) throw new Error("Alpaca model not initialised");

    const { body } = req;
    const cast = alpaca.cast( body );
    alpaca.validate( cast );
    alpaca.model.create( cast )
      .then( ( doc ) => {
        res.locals[alpaca.locals_name] = doc;
        next();
      } )
      .catch( next );
  }

  update: middleware = function( req, res, next ) {
    const { alpaca } = req;
    if ( !alpaca || typeof alpaca.model === "undefined" ) throw new Error("Alpaca model not initialised");
    const id = req.params[ alpaca.id_name ];
    if ( !validators.isValidIdString( id ) ) throw new Error(`Invalid id: ${ id }`);

    const { body } = req;
    const cast = alpaca.cast( body );
    alpaca.validate( cast );

    alpaca.model.findByIdAndUpdate( id, cast, { new: true } )
      .then( ( doc: AlpacaMongooseDocument | null ) => {
        res.locals[alpaca.locals_name] = doc;
        next();
      } )
      .catch( next );
  }

  destroy: middleware = function( req, res, next ) {
    const { alpaca } = req;
    if ( !alpaca || typeof alpaca.model === "undefined" ) throw new Error("Alpaca model not initialised");
    const id = req.params[ alpaca.id_name ];
    if ( !validators.isValidIdString( id ) ) throw new Error(`Invalid id: ${ id }`);

    alpaca.model.findByIdAndRemove( id )
    .then( ( doc ) => {
      res.locals[alpaca.locals_name] = doc;
      next();
    } )
    .catch( next );
  }  

}

export default AlpacaModel;