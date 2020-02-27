import { Types, Schema } from "mongoose";
import { AlpacaCaster, AlpacaValidator, AlpacaTypeOptions } from "./tsdefs";

import AlpacaType from "./type";
import validators from "../helpers/validators";

const IdCast : AlpacaCaster = function IdCast( value : any ) : Types.ObjectId | null {
  if ( validators.isValidIdString( value ) ) {
    return Types.ObjectId( value );
  } else {
    return null;
  }
}

const isValidIdOrNull : AlpacaValidator = function isValidIdOrNull( val : any ) : boolean {
  if ( validators.isValidId( val ) || val === null ) {
    return true;
  }
  return false;
}
export default class AlpacaRef extends AlpacaType {
  constructor( props : AlpacaTypeOptions ) {
    super( props );
    this.primitive = Schema.Types.ObjectId;
    this.castings.unshift( IdCast );
    this.validators.unshift( isValidIdOrNull );
  }
}