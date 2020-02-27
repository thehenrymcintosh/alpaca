import AlpacaType from "./type";
import { AlpacaCaster, AlpacaValidator, AlpacaTypeOptions } from "./tsdefs";


const toInt : AlpacaCaster = function toInt( val ) {
  if ( val === "" || typeof val === "undefined" ) {
    return null;
  }

  const parsed = parseInt( val, 10 );
  if ( isNaN( parsed ) ) return null;
  return parsed;
}

export default class AlpacaInt extends AlpacaType {
  primitive = Number;
  constructor( props : AlpacaTypeOptions ) {
    super( props );
    this.castings.unshift( toInt );
  }
}