/* eslint-disable no-continue */
/* eslint-disable complexity */
import { Mongoose, Types } from "mongoose";

/* eslint-disable max-len */
/* eslint-disable no-useless-escape */
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;
const bsonRegex = /^[a-f\d]{24}$/i;
const urlRegex = /https?:\/\/((www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#()?&//=]*)|(localhost(:[0-9]{4})?))/i;

function isValidName( name : any ) {
  if ( !name
    || typeof name !== "string"
    || name.length > 50 ) return false;
  return true;
}

function isValidFunction( func : any ) {
  return !!(func && func.constructor && func.call && func.apply);
}

function isValidText( text : any ) {
  if ( !text
    || typeof text !== "string" ) return false;
  return true;
}

function isValidBool( bool : any ) {
  if ( typeof bool !== "boolean" ) return false;
  return true;
}

function isValidDate( date : any ) {
  if ( !date || typeof date !== "object" || typeof date.getFullYear !== "function" || typeof date.getTime !== "function" || typeof date.getTime() !== "number" ) return false;
  return true;
}

function isValidEmail( email : any ) {
  if ( !isValidName( email ) || !emailRegex.test( email ) ) return false;
  return true;
}

function isValidArray( arr : any ) {
  if ( !Array.isArray( arr ) ) return false;
  return true;
}

function isValidIdString( testId : any ) {
  if ( !testId
    || typeof testId !== "string"
    || testId.length !== 24
    || !bsonRegex.test( testId ) ) return false;
  return true;
}

function isValidObject( obj : any ) {
  return obj === Object( obj )
    && !isValidArray( obj )
    && obj !== null
    && typeof obj !== "function";
}

function isValidId( testId : any ) {
  if ( !testId
    || !( testId instanceof Types.ObjectId ) ) return false;
  return true;
}

function isValidUrl( url : any ) {
  if ( !url
    || typeof url !== "string"
    || url.length > 250
    || !urlRegex.test( url ) ) return false;
  return true;
}

function isValidInt( num : any ) {
  if ( typeof num !== "number"
  || !Number.isInteger( num ) ) return false;
  return true;
}

function isValidNumber( num : any ) {
  if ( typeof num !== "number" ) return false;
  return true;
}

function findInvalidIds( ids : any ) {
  const invalidIds = [];
  for ( let i = 0; i < ids.length; i += 1 ) {
    if ( !bsonRegex.test( ids[ i ] ) ) {
      invalidIds.push( ids[ i ] );
    }
  }
  return invalidIds;
}

function getValidateMethodForType( type : string ) {
  if ( type === "array" ) return isValidArray;
  if ( type === "bool" ) return isValidBool;
  if ( type === "date" ) return isValidDate;
  if ( type === "email" ) return isValidEmail;
  if ( type === "id" ) return isValidIdString;
  if ( type === "objectId" ) return isValidId;
  if ( type === "int" ) return isValidInt;
  if ( type === "name" ) return isValidName;
  if ( type === "number" ) return isValidNumber;
  if ( type === "url" ) return isValidUrl;
  if ( type === "text" ) return isValidText;
  if ( type === "object" ) return isValidObject;
  throw new Error( `No validation method for type: "${ type }"` );
}

export default {
  isValidArray,
  isValidBool,
  isValidDate,
  isValidEmail,
  isValidIdString,
  isValidId,
  isValidInt,
  isValidName,
  isValidNumber,
  isValidUrl,
  isValidText,
  isValidObject,
  getValidateMethodForType,
  findInvalidIds,
  isValidFunction,
};
