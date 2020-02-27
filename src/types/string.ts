import AlpacaType from "./type";
import { AlpacaCaster, AlpacaTypeOptions } from "./tsdefs";

const strCast : AlpacaCaster = function strCast( this:AlpacaString, value : any ) {
  if ( this.null_or_non_empty_trimmed_string ) {
    if ( !value || value.trim().length === 0 ) {
      return null;
    } else {
      return value;
    }
  }
  return value;
}

export default class AlpacaString extends AlpacaType {
  constructor( props? : AlpacaTypeOptions ) {
    super( props );
    this.castings.unshift( strCast );
  }
}