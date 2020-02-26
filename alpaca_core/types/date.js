const AlpacaType = require("../type");
const validators = require("../helpers/validators");

function toDate( val ) {
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

module.exports = class AlpacaDate extends AlpacaType {
  primitive = Date;
  constructor( props ) {
    super( props );
    this.castings.unshift( toDate );
  }
}