import AlpacaType from "./type";
import validators from "../helpers/validators";
import { AlpacaCaster, AlpacaValidator, AlpacaTypeOptions } from "./tsdefs";

const toDate : AlpacaCaster = function toDate( val ) {
  if ( val === "" || typeof val === "undefined" ) {
    return null;
  }
  if ( validators.isValidDate( val ) ) {
    return val;
  }
  const parsed = new Date( val );
  if ( parsed.toString() === "Invalid Date" ) {
    return null;
  } 
  return parsed;
}

export default class AlpacaDate extends AlpacaType {
  primitive = Date;
  constructor( props? : AlpacaTypeOptions ) {
    super( props );
    this.castings.unshift( toDate );
  }
}