const AlpacaType = require("./type");
const validators = require("../helpers/validators");
const mongoose = require("mongoose");

function IdCast( value ) {
  if ( validators.isValidIdString( value ) ) {
    return mongoose.Types.ObjectId( value );
  } else {
    return null;
  }
}

function isValidIdOrNull( val ) {
  if ( validators.isValidId( val ) || val === null ) {
    return true;
  }
  return false;
}

module.exports = class AlpacaRef extends AlpacaType {
  constructor( props ) {
    super( props );
    this.primitive = mongoose.Schema.Types.ObjectId;
    this.castings.unshift( IdCast );
    this.validators.unshift( isValidIdOrNull );
  }
}