import { AlpacaArray, AlpacaDate, AlpacaType } from "../types/_index";
import validators from "./validators";
import { AlpacaCaster, AlpacaValidator, AlpacaTypeOptions, AlapacaPrimitive, AlpacaModelProp } from "../types/tsdefs";

export const primitiveToString = ( primitive : AlapacaPrimitive ) => {
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

interface extractedType {
  isAlpacaArray: boolean,
  rawObject: null | AlpacaModelProp
  type: AlpacaType,
  typeOrArray: AlpacaType | AlpacaArray
}

export const extractType = ( mixedInput : ArrayOrType | AlpacaModelProp ) : extractedType => {
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
  } 
  throw new Error("Not AlpacaType or AlpacaArray, and also not an object with .type of type AlpacaType or AlpacaArray!");
}