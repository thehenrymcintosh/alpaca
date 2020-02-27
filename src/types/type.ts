import { Schema } from "mongoose";

import { AlpacaValidator, AlpacaCaster, AlapacaPrimitive, AlpacaTypeOptions } from "./tsdefs";

class AlpacaType {

  constructor( props : AlpacaTypeOptions ) {
    if ( typeof props === 'object' && props !== null ) {
      const { 
        primitive, 
        null_or_non_empty_trimmed_string,
        validate,
        cast,
      } = props;
      if ( typeof primitive !== 'undefined') {
        this.primitive = primitive;
      }
      if ( typeof null_or_non_empty_trimmed_string !== 'undefined' ) {
        this.null_or_non_empty_trimmed_string = null_or_non_empty_trimmed_string;
      }
      if ( typeof validate !== 'undefined') {
        if ( Array.isArray( validate ) ) {
          this.validators.push( ...validate);
        } else {
          this.validators.push( validate );
        }
      }
      if ( typeof cast !== 'undefined') {
        if ( Array.isArray( cast ) ) {
          this.castings.push( ...cast);
        } else {
          this.castings.push( cast);
        }
      }
    }
    // @todo improve developer experience by:
    // validating all the fields
    // add typescript defs for intellisense
  }

  primitive : AlapacaPrimitive = String;
  null_or_non_empty_trimmed_string : boolean = true;

  validators: AlpacaValidator[] = [] ;
  castings : AlpacaCaster[] = [] ;

  cast( value : any ) {
    const alpaca = this;
    let valStore = value;
    for ( let i = 0; i < this.castings.length; i++ ) {
      let castFunction = this.castings[ i ].bind( alpaca );
      valStore = castFunction( valStore );
    }
    return valStore;
  }

  validate( value : any ) {
    const alpaca = this;
    for ( let i =0; i < this.validators.length; i++ ) {
      let validationFunction = this.validators[ i ].bind( alpaca );
      if ( !validationFunction( value ) ) {
        return false;
      }
    }
    return true;
  }
  
}

export default AlpacaType;