const mongoose = require("mongoose");
const express = require( "express" );
const AlpacaType = require("./type");
const validators = require("./validators");

function isDefined( variable ) {
  return typeof variable !== "undefined";
}

class AlpacaModel {
  constructor(name, props) {
    this.name = name;
    this.locals_name = name.toLowerCase();
    this.id_name = name.toLowerCase() + "_id";
    this.raw_model = {
      ...props,
    }
    this.populators = [];
    this.generateRouter();
    this.generateMongoose();
  }

  generateRouter() {
    const alpaca = this;
    this.router = express.Router();

    this.router.use( ( req, res, next ) => {
      req.alpaca = alpaca;
      next();
    })

    this.router.get("/", alpaca.index );
    this.router.get(`/:${this.id_name}`, alpaca.read );
    this.router.post(`/`, alpaca.create );
    this.router.post(`/:${this.id_name}`, alpaca.update );
    this.router.delete(`/:${this.id_name}`, alpaca.destroy );

    this.router.use( ( req, res ) => {
      res.json( res.locals );
    })

    this.router.use( ( err, req, res, next ) => {
      res.json( {
        error: err.message,
        trace: err.stack,
      } );
    })
  }

  generateMongoose() {
    const modelKeys = Object.keys( this.raw_model );
    this.mongooseTemplate = {};
    const alpaca = this;
    modelKeys.forEach( modelKey => {
      const modelValue = this.raw_model[ modelKey ];
      if ( modelValue && modelValue.type instanceof AlpacaType ) {
        this.mongooseTemplate[ modelKey ] = {
          type: modelValue.type.primitive
        }
        if ( modelValue.ref ) {
          this.mongooseTemplate[ modelKey ].ref = modelValue.ref;
        }
        if ( modelValue.populate && modelValue.ref ) {
          alpaca.populators.push( modelKey );
        }
      } else if ( modelValue instanceof AlpacaType ) {
        this.mongooseTemplate[ modelKey ] = modelValue.primitive;
      }
    } )
    
    const schema = new mongoose.Schema( this.mongooseTemplate );
    this.model = mongoose.model( this.name, schema );
  }

  cast( body = {} ) {
    const modelKeys = Object.keys( this.raw_model );
    const newBody = {};
    modelKeys.forEach( modelKey => {
      const modelValue = this.raw_model[ modelKey ];
      if ( modelValue && modelValue.type instanceof AlpacaType ) {
        newBody[ modelKey ] = modelValue.type.cast( body[ modelKey ] );
      } else if ( modelValue instanceof AlpacaType ) {
        newBody[ modelKey ] = modelValue.cast( body[ modelKey ] );
      }
    } )
    return newBody;
  }

  validate( body ) {
    const modelKeys = Object.keys( this.raw_model );
    modelKeys.forEach( modelKey => {
      const modelValue = this.raw_model[ modelKey ];
      if ( modelValue && modelValue.type instanceof AlpacaType ) {
        if ( !modelValue.type.validate( body[ modelKey ] ) ) throw new Error(`Invalid ${this.name} ${modelKey}: ${ body[ modelKey ]}`);
        if ( !body[ modelKey ] && modelValue.required ) throw new Error(`${this.name} ${modelKey} is required`);
      } else if ( modelValue instanceof AlpacaType ) {
        if ( !modelValue.validate( body[ modelKey ] ) ) throw new Error(`Invalid ${this.name} ${modelKey}: ${ body[ modelKey ]}`);
        if ( !body[ modelKey ] ) throw new Error(`${this.name} ${modelKey} is required`);
      }
    } )
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