const mongoose = require("mongoose");
const express = require( "express" );
const AlpacaType = require("./type");
const AlpacaArray = require("./types/array");

const validators = require("./helpers/validators");
const fileHandler = require("./helpers/fileHandler");
const fs = require('fs');
const path = require("path");
const { compile } = require('json-schema-to-typescript');
const GlobalModelStore = {};

function getModelByName( name ) {
  return GlobalModelStore[ name.toLowerCase() ];
}

const primitiveToString = ( primitive ) => {
  if ( validators.isValidFunction( primitive ) ) {
    if ( primitive.name === "ObjectId" ){
      return "string";
    } else {
      return primitive.name;
    }
  } 
  if ( validators.isValidText( primitive ) ) return primitive;
  throw new Error(`Cannot cast primitive "${primitive}" to string!`)
}

const extractType = ( mixedInput ) => {
  if ( mixedInput instanceof AlpacaType ) {
    return {
      isAlpacaArray: false,
      type: mixedInput,
      rawObject: null,
      typeOrArray: mixedInput,
    }
  } else if ( mixedInput instanceof AlpacaArray ) {
    return {
      isAlpacaArray: true,
      type: mixedInput.type,
      rawObject: null,
      typeOrArray: mixedInput,
    }
  } else if ( validators.isValidObject( mixedInput ) && ( mixedInput.type instanceof AlpacaArray || mixedInput.type instanceof AlpacaType ) ) {
    if ( mixedInput.type instanceof AlpacaType ) {
      return {
        isAlpacaArray: false,
        type: mixedInput.type,
        rawObject: mixedInput,
        typeOrArray: mixedInput.type,
      }
    } else if ( mixedInput.type instanceof AlpacaArray ) {
      return {
        isAlpacaArray: true,
        type: mixedInput.type.type,
        rawObject: mixedInput,
        typeOrArray: mixedInput.type,
      }
    }
  } else {
    throw new Error("Not AlpacaType or AlpacaArray, and also not an object with .type of type AlpacaType or AlpacaArray!");
  }
}
class AlpacaModel {
  constructor(name, props, options = {}) {
    if ( GlobalModelStore[ name.toLowerCase() ] ) throw new Error("Model names must be unique!");
    this.name = name;
    if ( name.indexOf(" ") >= 0 ) throw new Error("Model names cannot contain spaces! '" + name +"'");
    this.locals_name = name.toLowerCase();
    this.id_name = name.toLowerCase() + "_id";
    this.raw_model = {
      ...props,
    }
    this.options = options;
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
    GlobalModelStore[ name.toLowerCase() ] = this;
  }

  generateRouter() {
    const alpaca = this;
    this.router = express.Router();
    const alpacaMountMiddleware = this.getAlpacaMountMiddleware();

    this.router.use( alpacaMountMiddleware )
    this.router.get("/", alpaca.index );
    this.router.get(`/:${this.id_name}`, alpaca.read );
    this.router.post(`/`, alpaca.create );
    this.router.post(`/:${this.id_name}`, alpaca.update );
    this.router.delete(`/:${this.id_name}`, alpaca.destroy );
    if ( validators.isValidArray( this.options.nestedRest ) ) {
      this.options.nestedRest.forEach( route => {
        this.router.get(`/:${this.id_name}/${route.path}`, ( req, res, next ) => {
          const query = {};
          const id = req.params[ this.id_name ];
          query[`${route.foreignField}`] = id;
          if ( !validators.isValidIdString( id ) ) throw new Error(`Invalid id: ${ id }`);
          const foreignModel = getModelByName(route.modelName);
          
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
      this.router[ route.method ]( `/:${this.id_name}/${route.path}`, route.middleware );
    })

  }

  // @todo still need to be able to save and populate array of references inmongodb
  generateMongoose() {
    const modelKeys = Object.keys( this.raw_model );
    this.mongooseTemplate = {};
    const alpaca = this;
    modelKeys.forEach( modelKey => {
      const modelValue = this.raw_model[ modelKey ];
      const { rawObject, isAlpacaArray, type } = extractType(modelValue);
      const newMongooseProp = { required: true };
      if ( isAlpacaArray ) {
        newMongooseProp.type = [ type.primitive ];
      } else {
        newMongooseProp.type = type.primitive;
      }
      if ( rawObject ) {
        if ( rawObject.ref ) newMongooseProp.ref = rawObject.ref;
        if ( rawObject.populate && rawObject.ref ) alpaca.populators.push( modelKey );
        if ( validators.isValidBool( rawObject.required ) ) newMongooseProp.required = rawObject.required;
      }
      this.mongooseTemplate[ modelKey ] = newMongooseProp;
    } )
    
    const schema = new mongoose.Schema( this.mongooseTemplate );
    this.model = mongoose.model( this.name, schema );
  }


  getOpenApiProperties() {
    const toWrite = {
      title: this.name,
      properties: {},
    }
    const required = [];
    if ( tags ) toWrite.tags = tags;
    const modelKeys = Object.keys( this.raw_model );
    modelKeys.forEach( modelKey => {
      const modelValue = this.raw_model[ modelKey ];
      const { rawObject, type, isAlpacaArray } = extractType(modelValue);
      let isRequired = true;
      if ( rawObject && validators.isValidBool(rawObject.required) ) isRequired = rawObject.required;
      if ( rawObject && rawObject.populate && validators.isValidName(rawObject.ref) && GlobalModelStore[rawObject.ref.toLowerCase()] ){
        if ( isAlpacaArray ) {
          toWrite.properties[ modelKey ] = {items: getModelByName(rawObject.ref).getOpenApiProperties()};
        } else {
          toWrite.properties[ modelKey ] = getModelByName(rawObject.ref).getOpenApiProperties();
        }  
      } else {
        if ( isAlpacaArray ) {
          toWrite.properties[ modelKey ] = { items: { type: primitiveToString(type.primitive).toLowerCase(), } }
        } else {
          toWrite.properties[ modelKey ] = { type: primitiveToString(type.primitive).toLowerCase(), }
        }
      }
      if ( rawObject && rawObject.example ) toWrite.properties[ modelKey ].example = rawObject.example;
      if ( isRequired ) required.push( modelKey );
    } );
    if ( required.length > 0 ) toWrite.required = required;
    return toWrite;
  }

  generateOpenApi( newOptions ) {
    if ( newOptions && validators.isValidObject( newOptions ) ) this.options.generateOpenApi = newOptions;

    const { dir, tags } = this.options.generateOpenApi;
    if ( !validators.isValidText( dir ) ) throw new Error( "'options.generateOpenApi.dir' must be a valid path string for the output directory!");
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true } );
    }
    const filePath = path.join(dir, `${this.name}.json`);
    this.options.generateOpenApi.filePath = filePath;
    
    const toWrite = this.getTsProperties();
    fileHandler.saveIfChanged( filePath, toWrite, true );
  }


  getTsProperties(){
    const { additionalProperties } = this.options.generateTs;

    const required = [];
    const toWrite = {
      title: this.name,
      type: "object",
      properties: {},
    }
    if ( validators.isValidBool( additionalProperties ) ) toWrite.additionalProperties = additionalProperties;
    const modelKeys = Object.keys( this.raw_model );
    modelKeys.forEach( modelKey => {
      const modelValue = this.raw_model[ modelKey ];
      const { isAlpacaArray, rawObject, type } = extractType(modelValue);
      let isRequired = true;
      if ( rawObject && validators.isValidBool(rawObject.required) ) isRequired = rawObject.required;
      if ( rawObject && rawObject.populate && validators.isValidName(rawObject.ref) && GlobalModelStore[rawObject.ref.toLowerCase()] ){
        if ( isAlpacaArray ) {
          toWrite.properties[ modelKey ] = {items: getModelByName(rawObject.ref).getTsProperties()};
        } else {
          toWrite.properties[ modelKey ] = getModelByName(rawObject.ref).getTsProperties();
        }  
      } else {
        if ( isAlpacaArray ) {
          toWrite.properties[ modelKey ] = { items: { type: primitiveToString(type.primitive).toLowerCase(), } }
        } else {
          toWrite.properties[ modelKey ] = { type: primitiveToString(type.primitive).toLowerCase(), }
        }
      }
      if ( rawObject && rawObject.description ) toWrite.properties[ modelKey ].description = rawObject.description;
      if ( rawObject && rawObject.enum && validators.isValidArray( rawObject.enum ) ) toWrite.properties[ modelKey ].enum = rawObject.enum;
      if ( isRequired ) required.push( modelKey );
    } );
    console.log( toWrite );

    if ( required.length > 0 ) toWrite.required = required;
    return toWrite;
  }

  generateTs( newOptions ) {
    if ( newOptions && validators.isValidObject( newOptions ) ) this.options.generateTs = newOptions;
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
      .then(ts => {
        fileHandler.saveIfChanged( filePath, ts);
      })
  }

  cast( body = {} ) {
    const modelKeys = Object.keys( this.raw_model );
    const newBody = {};
    modelKeys.forEach( modelKey => {
      const modelValue = this.raw_model[ modelKey ];
      const { typeOrArray } = extractType(modelValue);
      newBody[ modelKey ] = typeOrArray.cast( body[ modelKey ] );
    } )
    return newBody;
  }

  validate( body ) {
    const modelKeys = Object.keys( this.raw_model );
    modelKeys.forEach( modelKey => {
      const modelValue = this.raw_model[ modelKey ];
      const { rawObject, typeOrArray } = extractType(modelValue);
      let required = true;
      if ( rawObject && validators.isValidBool(rawObject.required) ) required = rawObject.required;
      if ( !typeOrArray.validate( body[ modelKey ] ) ) throw new Error(`Invalid ${this.name} ${modelKey}: ${ body[ modelKey ]}`);
      if ( !body[ modelKey ] && required ) throw new Error(`${this.name} ${modelKey} is required`);
    } )
  }

  getAlpacaMountMiddleware() {
    const alpaca = this;
    return ( req, res, next ) => {
      req.alpaca = alpaca;
      next();
    }
  }

  read( req, res, next ) {
    const { alpaca } = req;
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

  index( req, res, next ) {
    const { alpaca } = req;

    alpaca.model.find()
    .populate( alpaca.populators.join(" ") )
    .exec()
    .then( ( docs ) => {
      res.locals[alpaca.locals_name + "s"] = docs;
      next();
    } )
    .catch( next );
  }

  create( req, res, next ) {
    const { alpaca } = req;

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

  update( req, res, next ) {
    const { alpaca } = req;
    const id = req.params[ alpaca.id_name ];
    if ( !validators.isValidIdString( id ) ) throw new Error(`Invalid id: ${ id }`);

    const { body } = req;
    const cast = alpaca.cast( body );
    alpaca.validate( cast );

    alpaca.model.findByIdAndUpdate( id, cast, { new: true, useFindAndModify: false } )
      .then( ( doc ) => {
        res.locals[alpaca.locals_name] = doc;
        next();
      } )
      .catch( next );
  }

  destroy( req, res, next ) {
    const { alpaca } = req;
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

module.exports = AlpacaModel;