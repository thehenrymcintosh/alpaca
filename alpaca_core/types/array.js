const AlpacaType = require("./type");

const defaultOptions = {
  allowNullInArray: false,
}

class AlpacaArray {
  constructor( props, options = defaultOptions ) {
    if ( !props instanceof AlpacaType ) throw new Error("Can only have arrays of AlpacaTypes");
    this.type = props;
    this.options = options;
  }

  cast( arrayOfValues ) {
    const alpaca = this;
    const returnArray = [];
    for ( let i=0; i < arrayOfValues.length; i++ ) {
      returnArray.push( alpaca.type.cast( arrayOfValues[i] ) )
    }
    return returnArray;
  }

  validate( arrayOfValues ) {
    const alpaca = this;
    for ( let i=0; i < arrayOfValues.length; i++ ) {
      if ( !alpaca.type.validate( arrayOfValues[i] ) ) {
        return false;
      } else if ( alpaca.options.allowNullInArray === false && arrayOfValues[i] === null ){
        return false;
      }
    }
    return true;
  }
  
}

module.exports = AlpacaArray;