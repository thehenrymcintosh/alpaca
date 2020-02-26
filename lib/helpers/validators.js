"use strict";
/* eslint-disable no-continue */
/* eslint-disable complexity */
var Mongoose = require("mongoose");
/* eslint-disable max-len */
/* eslint-disable no-useless-escape */
var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;
var bsonRegex = /^[a-f\d]{24}$/i;
var urlRegex = /https?:\/\/((www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#()?&//=]*)|(localhost(:[0-9]{4})?))/i;
function isValidName(name) {
    if (!name
        || typeof name !== "string"
        || name.length > 50)
        return false;
    return true;
}
function isValidFunction(func) {
    return !!(func && func.constructor && func.call && func.apply);
}
function isValidText(text) {
    if (!text
        || typeof text !== "string")
        return false;
    return true;
}
function isValidBool(bool) {
    if (typeof bool !== "boolean")
        return false;
    return true;
}
function isValidDate(date) {
    if (!date || typeof date !== "object" || typeof date.getFullYear !== "function" || typeof date.getTime !== "function" || typeof date.getTime() !== "number")
        return false;
    return true;
}
function isValidEmail(email) {
    if (!isValidName(email) || !emailRegex.test(email))
        return false;
    return true;
}
function isValidArray(arr) {
    if (!Array.isArray(arr))
        return false;
    return true;
}
function isValidIdString(testId) {
    if (!testId
        || typeof testId !== "string"
        || testId.length !== 24
        || !bsonRegex.test(testId))
        return false;
    return true;
}
function isValidObject(obj) {
    return obj === Object(obj)
        && !isValidArray(obj)
        && obj !== null
        && typeof obj !== "function";
}
function isValidId(testId) {
    if (!testId
        || !(testId instanceof Mongoose.Types.ObjectId))
        return false;
    return true;
}
function isValidUrl(url) {
    if (!url
        || typeof url !== "string"
        || url.length > 250
        || !urlRegex.test(url))
        return false;
    return true;
}
function isValidInt(num) {
    if (typeof num !== "number"
        || !Number.isInteger(num))
        return false;
    return true;
}
function isValidNumber(num) {
    if (typeof num !== "number")
        return false;
    return true;
}
function findInvalidIds(ids) {
    var invalidIds = [];
    for (var i = 0; i < ids.length; i += 1) {
        if (!bsonRegex.test(ids[i])) {
            invalidIds.push(ids[i]);
        }
    }
    return invalidIds;
}
function getValidateMethodForType(type) {
    if (type === "array")
        return isValidArray;
    if (type === "bool")
        return isValidBool;
    if (type === "date")
        return isValidDate;
    if (type === "email")
        return isValidEmail;
    if (type === "id")
        return isValidIdString;
    if (type === "objectId")
        return isValidId;
    if (type === "int")
        return isValidInt;
    if (type === "name")
        return isValidName;
    if (type === "number")
        return isValidNumber;
    if (type === "url")
        return isValidUrl;
    if (type === "text")
        return isValidText;
    if (type === "object")
        return isValidObject;
    throw new Error("No validation method for type: \"" + type + "\"");
}
function validateObject(target, schema) {
    if (typeof schema !== "object")
        throw new Error("Schema is not an object.");
    if (typeof target !== "object")
        throw new Error("Target is not an object.");
    var schemaKeys = Object.keys(schema).sort();
    var targetKeys = Object.keys(target).sort();
    var keyErr = new Error("Schema keys (" + schemaKeys + ") don't match target keys (" + Object.keys(target).sort() + ").");
    if (schemaKeys.length !== targetKeys.length)
        throw keyErr;
    schemaKeys.forEach(function (key, index) {
        if (key !== targetKeys[index]) {
            throw keyErr;
        }
    });
    for (var i = 0; i < schemaKeys.length; i += 1) {
        var key = schemaKeys[i];
        var compVal = schema[key];
        if (typeof schema[key] === "object") {
            var isUndef = (target[key] === undefined || target[key] === null || target[key] === "");
            if (!compVal.optional && isUndef)
                throw new Error("Key \"" + key + "\" is not optional and is not set.");
            if (compVal.optional && isUndef) {
                continue;
            }
            if (Array.isArray(compVal.allowedVals)) {
                if (compVal.allowedVals.indexOf(target[key]) === -1) {
                    throw new Error("Key \"" + key + "\" value \"" + target[key] + "\" (optional=" + !!compVal.optional + ") is not an allowed value of this field. Must be one of " + compVal.allowedVals);
                }
            }
            else {
                var isValidParam = getValidateMethodForType(compVal.type)(target[key]);
                if (!isValidParam) {
                    throw new Error("Key \"" + key + "\" value \"" + target[key] + "\" (optional=" + !!compVal.optional + ") is not a valid " + compVal.type + ".");
                }
            }
        }
        else {
            var isValidParam = getValidateMethodForType(compVal)(target[key]);
            if (!isValidParam) {
                throw new Error("Key \"" + key + "\" value \"" + target[key] + "\" is not a valid " + compVal + ".");
            }
        }
    }
    return true;
}
module.exports = {
    isValidArray: isValidArray,
    isValidBool: isValidBool,
    isValidDate: isValidDate,
    isValidEmail: isValidEmail,
    isValidIdString: isValidIdString,
    isValidId: isValidId,
    isValidInt: isValidInt,
    isValidName: isValidName,
    isValidNumber: isValidNumber,
    isValidUrl: isValidUrl,
    isValidText: isValidText,
    isValidObject: isValidObject,
    getValidateMethodForType: getValidateMethodForType,
    validateObject: validateObject,
    findInvalidIds: findInvalidIds,
    isValidFunction: isValidFunction,
};
