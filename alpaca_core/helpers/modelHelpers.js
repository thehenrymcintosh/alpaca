const { AlpacaArray, AlpacaDate, AlpacaType } = require("../types/_index");
const validators = require("./validators");

const primitiveToString = ( primitive ) => {
  if ( validators.isValidFunction( primitive ) ) {
    if ( primitive.name === "ObjectId" ){
      return "string";
    } else {
      return primitive.name.toLowerCase();
    }
  } 
  if ( validators.isValidText( primitive ) ) return primitive.toLowerCase();
  throw new Error(`Cannot cast primitive "${primitive}" to string!`)
}

const extractType = ( mixedInput ) => {
  if ( mixedInput instanceof AlpacaType ) {
    return {
      isAlpacaArray: false,
      type: mixedInput,
      rawObject: null,
      typeOrArray: mixedInput,
    }
  } else if ( mixedInput instanceof AlpacaArray ) {
    return {
      isAlpacaArray: true,
      type: mixedInput.type,
      rawObject: null,
      typeOrArray: mixedInput,
    }
  } else if ( validators.isValidObject( mixedInput ) && ( mixedInput.type instanceof AlpacaArray || mixedInput.type instanceof AlpacaType ) ) {
    if ( mixedInput.type instanceof AlpacaType ) {
      return {
        isAlpacaArray: false,
        type: mixedInput.type,
        rawObject: mixedInput,
        typeOrArray: mixedInput.type,
      }
    } else if ( mixedInput.type instanceof AlpacaArray ) {
      return {
        isAlpacaArray: true,
        type: mixedInput.type.type,
        rawObject: mixedInput,
        typeOrArray: mixedInput.type,
      }
    }
  } else {
    throw new Error("Not AlpacaType or AlpacaArray, and also not an object with .type of type AlpacaType or AlpacaArray!");
  }
}

module.exports = {
  primitiveToString,
  extractType,
}