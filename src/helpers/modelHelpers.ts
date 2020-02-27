import { AlpacaArray, AlpacaDate, AlpacaType } from "../types/_index";
import validators from "./validators";
import { AlpacaCaster, AlpacaValidator, AlpacaTypeOptions, AlapacaPrimitive } from "../types/tsdefs";

const primitiveToString = ( primitive : AlapacaPrimitive ) => {
  if ( validators.isValidFunction( primitive ) ) {
    if ( primitive.name === "ObjectId" ){
      return "string";
    } else {
      return primitive.name.toLowerCase();
    }
  } 
  throw new Error(`Cannot cast primitive "${primitive}" to string!`)
}

type ArrayOrType = AlpacaType | AlpacaArray;
interface modelProp {
  type: ArrayOrType,
  [k:string]: any
}

const extractType = ( mixedInput : ArrayOrType | modelProp ) => {
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

export = {
  primitiveToString,
  extractType,
}