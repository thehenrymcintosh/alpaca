const AlpacaType = require("../type");

function strCast( value ) {
  if ( this.null_or_non_empty_trimmed_string ) {
    if ( !value || value.trim().length === 0 ) {
      return null;
    } else {
      return value;
    }
  }
  return value;
}

module.exports = class AlpacaString extends AlpacaType {
  castings = [ strCast ];
}