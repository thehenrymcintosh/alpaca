import AlpacaType from "./type";
import { AlpacaCaster, AlpacaValidator, AlpacaTypeOptions } from "./tsdefs";

interface AlpacaArrayOptions {
  allowNullInArray: boolean,
}

const defaultOptions : AlpacaArrayOptions = {
  allowNullInArray: false,
}


class AlpacaArray {
  constructor( props : AlpacaType, options? : AlpacaArrayOptions ) {
    if ( !(props instanceof AlpacaType) ) throw new Error("Can only have arrays of AlpacaTypes");
    this.type = props;
    if ( typeof options !== "undefined" ){
      this.options = options;
    }
  }

  options: AlpacaArrayOptions = defaultOptions;
  type: AlpacaType;

  cast( arrayOfValues: any[] ) {
    const alpaca = this;
    const returnArray = [];
    for ( let i=0; i < arrayOfValues.length; i++ ) {
      returnArray.push( alpaca.type.cast( arrayOfValues[i] ) )
    }
    return returnArray;
  }

  validate( arrayOfValues: any[] ) {
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

export default AlpacaArray;