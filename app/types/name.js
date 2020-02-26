const { Types } = require("../../alpaca_core/index");
const { AlpacaString } = Types;

const name = class AlpacaName extends AlpacaString {
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