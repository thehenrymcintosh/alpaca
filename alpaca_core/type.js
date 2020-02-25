class AlpacaType {

  constructor( props ) {
    if ( typeof props === 'object' && props !== null ) {
      const { 
        primitive, 
        null_or_non_empty_trimmed_string,
        validators,
        castings,
      } = props;
      if ( typeof primitive !== 'undefined') {
        this.primitive = primitive;
      }
      if ( typeof null_or_non_empty_trimmed_string !== 'undefined' ) {
        this.null_or_non_empty_trimmed_string = null_or_non_empty_trimmed_string;
      }
      if ( typeof validators !== 'undefined') {
        if ( Array.isArray( validators ) ) {
          this.validators.push( ...validators);
        } else {
          this.validators.push( validators);
        }
      }
      if ( typeof castings !== 'undefined') {
        if ( Array.isArray( castings ) ) {
          this.castings.push( ...castings);
        } else {
          this.castings.push( castings);
        }
      }
    }
    // @todo improve developer experience by:
    // validating all the fields
    // add typescript defs for intellisense
  }

  primitive = String;
  null_or_non_empty_trimmed_string = true;

  validators = [];
  castings = [];

  cast( value ) {
    const alpaca = this;
    let valStore = value;
    for ( let i = 0; i < this.castings.length; i++ ) {
      console.log( this.castings[ i ])
      let castFunction = this.castings[ i ].bind( alpaca );
      valStore = castFunction( valStore );
    }
    return valStore;
  }

  validate( value ) {
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

module.exports = AlpacaType;