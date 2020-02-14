const { Str } = require("../../alpaca_core/types/_index");
const AlpacaType = require("../../alpaca_core/type");

const name = class AlpacaName extends Str {
  constructor( props ) {
    super( props );
    this.validators.push( ( name ) => {
      if ( typeof name === "string" && name.length > 50 ) return false;
      return true;
    } )
    this.castings.push( function trimstr(name) { 
      try {
        return name.trim() 
      } catch (error) {
        return name;
      }
    } )
  }
}

module.exports = name;