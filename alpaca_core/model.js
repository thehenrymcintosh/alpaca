const mongoose = require("mongoose");
const express = require( "express" );
const AlpacaType = require("./type");
const AlpacaArray = require("./types/array");

const validators = require("./helpers/validators");
const fileHandler = require("./helpers/fileHandler");
const fs = require('fs');
const path = require("path");
const { compile } = require('json-schema-to-typescript');

const primitiveToString = ( primitive ) => {
  if ( validators.isValidFunction( primitive ) ) return primitive.name;
  if ( validators.isValidText( primitive ) ) return primitive;
  throw new Error(`Cannot cast primitive "${primitive}" to string!`)
}

const extractType = ( mixedInput ) => {
  if ( mixedInput instanceof AlpacaType ) {
    return {
      isAlpacaArray: false,
      type: mixedInput,
      rawObject: null,
    }
  } else if ( mixedInput instanceof AlpacaArray ) {
    return {
      isAlpacaArray: true,
      type: mixedInput.type,
      rawObject: null,
    }
  } else if ( validators.isValidObject( mixedInput ) && ( mixedInput.type instanceof AlpacaArray || mixedInput.type instanceof AlpacaType ) ) {
    if ( mixedInput.type instanceof AlpacaType ) {
      return {
        isAlpacaArray: false,
        type: mixedInput.type,
        rawObject: mixedInput,
      }
    } else if ( mixedInput.type instanceof AlpacaArray ) {
      return {
        isAlpacaArray: true,
        type: mixedInput.type.type,
        rawObject: mixedInput,
      }
    }
  } else {
    throw new Error("Not AlpacaType or AlpacaArray, and also not an object with .type of type AlpacaType or AlpacaArray!");
  }
}
class AlpacaModel {
  constructor(name, props, options = {}) {
    this.name = name;
    if ( name.indexOf(" ") >= 0 ) throw new Error("Model names cannot contain spaces! '" + name +"'");
    this.locals_name = name.toLowerCase();
    this.id_name = name.toLowerCase() + "_id";
    this.raw_model = {
      ...props,
    }
    this.options = options;
    this.populators = [];
    if ( this.options.generateOpenApi ) {
      this.generateOpenApi();
    }
    if ( this.options.generateTs ) {
      this.generateTs();
    }
    this.generateRouter();
    this.generateMongoose();
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
  }

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

  // @todo update generateOpenApi to accommodate AlpacaArray
  generateOpenApi() {
    const { dir, tags } = this.options.generateOpenApi;
    if ( !validators.isValidText( dir ) ) throw new Error( "'options.generateOpenApi.dir' must be a valid path string for the output directory!");
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true } );
    }
    const filePath = path.join(dir, `${this.name}.json`);
    const toWrite = {
      title: this.name,
      properties: {},
    }
    const required = [];
    if ( tags ) toWrite.tags = tags;
    const modelKeys = Object.keys( this.raw_model );
    modelKeys.forEach( modelKey => {
      const modelValue = this.raw_model[ modelKey ];
      if ( modelValue && modelValue.type instanceof AlpacaType ) {
        toWrite.properties[ modelKey ] = {
          type: primitiveToString(modelValue.type.primitive),
        }
        if ( modelValue.example ) toWrite.properties[ modelKey ].example = modelValue.example;
        if ( modelValue.required && validators.isValidBool( modelValue.required ) ) required.push( modelKey );;
      } else if ( modelValue instanceof AlpacaType ) {
        toWrite.properties[ modelKey ] = {
          type: primitiveToString(modelValue.primitive),
        };
        required.push( modelKey );
      }
    } );
    if ( required.length > 0 ) toWrite.required = required;

    fileHandler.saveIfChanged( filePath, toWrite, true );
  }

   // @todo update generateTs to accommodate AlpacaArray
  generateTs() {
    const { dir, additionalProperties } = this.options.generateTs;
    if ( !validators.isValidText( dir ) ) throw new Error( "'options.generateTs.dir' must be a valid path string for the output directory!");
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true } );
    }
    const filePath = path.join(dir, `${this.name}.ts`);
    const required = [];
    const toWrite = {
      title: this.name,
      type: "object",
      properties: {},
    }
    if ( additionalProperties && validators.isValidBool( additionalProperties ) ) toWrite.additionalProperties = additionalProperties;
    const modelKeys = Object.keys( this.raw_model );
    modelKeys.forEach( modelKey => {
      const modelValue = this.raw_model[ modelKey ];
      if ( modelValue && modelValue.type instanceof AlpacaType ) {
        toWrite.properties[ modelKey ] = {
          type: primitiveToString(modelValue.type.primitive).toLowerCase(),
        }
        if ( modelValue.description ) toWrite.properties[ modelKey ].description = modelValue.description;
        if ( modelValue.enum && validators.isValidArray( modelValue.enum ) ) toWrite.properties[ modelKey ].enum = modelValue.enum;
        if ( modelValue.required && validators.isValidBool( modelValue.required ) ) required.push( modelKey );
      } else if ( modelValue instanceof AlpacaType ) {
        toWrite.properties[ modelKey ] = {
          type: primitiveToString(modelValue.primitive).toLowerCase(),
        };
        required.push( modelKey );
      }
    } );
    if ( required.length > 0 ) toWrite.required = required;

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
      if ( modelValue && ( modelValue.type instanceof AlpacaType || modelValue.type instanceof AlpacaArray ) ) {
        newBody[ modelKey ] = modelValue.type.cast( body[ modelKey ] );
      } else if ( modelValue instanceof AlpacaType || modelValue instanceof AlpacaArray ) {
        newBody[ modelKey ] = modelValue.cast( body[ modelKey ] );
      }
    } )
    return newBody;
  }

  validate( body ) {
    const modelKeys = Object.keys( this.raw_model );
    modelKeys.forEach( modelKey => {
      const modelValue = this.raw_model[ modelKey ];
      if ( modelValue && (modelValue.type instanceof AlpacaType || modelValue.type instanceof AlpacaArray) ) {
        if ( !modelValue.type.validate( body[ modelKey ] ) ) throw new Error(`Invalid ${this.name} ${modelKey}: ${ body[ modelKey ]}`);
        if ( !body[ modelKey ] && modelValue.required ) throw new Error(`${this.name} ${modelKey} is required`);
      } else if ( modelValue instanceof AlpacaType || modelValue instanceof AlpacaArray ) {
        if ( !modelValue.validate( body[ modelKey ] ) ) throw new Error(`Invalid ${this.name} ${modelKey}: ${ body[ modelKey ]}`);
        if ( !body[ modelKey ] ) throw new Error(`${this.name} ${modelKey} is required`);
      }
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
    console.log( cast );
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