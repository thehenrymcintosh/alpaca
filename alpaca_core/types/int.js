const AlpacaType = require("../type");


function toInt( val ) {
  if ( val === "" || typeof val === "undefined" ) {
    return null;
  }

  const parsed = parseInt( val, 10 );
  if ( isNaN( parsed ) ) return null;
  return parsed;
}

module.exports = class AlpacaInt extends AlpacaType {
  primitive = Number;
  castings = [ toInt ];
}