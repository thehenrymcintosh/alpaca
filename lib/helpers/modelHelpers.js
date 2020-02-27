"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _index_1 = require("../types/_index");
var validators_1 = require("./validators");
exports.primitiveToString = function (primitive) {
    if (validators_1.default.isValidFunction(primitive)) {
        if (primitive.name === "ObjectId") {
            return "string";
        }
        else {
            return primitive.name.toLowerCase();
        }
    }
    throw new Error("Cannot cast primitive \"" + primitive + "\" to string!");
};
exports.extractType = function (mixedInput) {
    if (mixedInput instanceof _index_1.AlpacaType) {
        return {
            isAlpacaArray: false,
            type: mixedInput,
            rawObject: null,
            typeOrArray: mixedInput,
        };
    }
    else if (mixedInput instanceof _index_1.AlpacaArray) {
        return {
            isAlpacaArray: true,
            type: mixedInput.type,
            rawObject: null,
            typeOrArray: mixedInput,
        };
    }
    else if (validators_1.default.isValidObject(mixedInput) && (mixedInput.type instanceof _index_1.AlpacaArray || mixedInput.type instanceof _index_1.AlpacaType)) {
        if (mixedInput.type instanceof _index_1.AlpacaType) {
            return {
                isAlpacaArray: false,
                type: mixedInput.type,
                rawObject: mixedInput,
                typeOrArray: mixedInput.type,
            };
        }
        else if (mixedInput.type instanceof _index_1.AlpacaArray) {
            return {
                isAlpacaArray: true,
                type: mixedInput.type.type,
                rawObject: mixedInput,
                typeOrArray: mixedInput.type,
            };
        }
    }
    throw new Error("Not AlpacaType or AlpacaArray, and also not an object with .type of type AlpacaType or AlpacaArray!");
};
