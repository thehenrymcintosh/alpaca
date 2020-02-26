"use strict";
var AlpacaType = require("./type");
var defaultOptions = {
    allowNullInArray: false,
};
var AlpacaArray = /** @class */ (function () {
    function AlpacaArray(props, options) {
        if (options === void 0) { options = defaultOptions; }
        if (!props instanceof AlpacaType)
            throw new Error("Can only have arrays of AlpacaTypes");
        this.type = props;
        this.options = options;
    }
    AlpacaArray.prototype.cast = function (arrayOfValues) {
        var alpaca = this;
        var returnArray = [];
        for (var i = 0; i < arrayOfValues.length; i++) {
            returnArray.push(alpaca.type.cast(arrayOfValues[i]));
        }
        return returnArray;
    };
    AlpacaArray.prototype.validate = function (arrayOfValues) {
        var alpaca = this;
        for (var i = 0; i < arrayOfValues.length; i++) {
            if (!alpaca.type.validate(arrayOfValues[i])) {
                return false;
            }
            else if (alpaca.options.allowNullInArray === false && arrayOfValues[i] === null) {
                return false;
            }
        }
        return true;
    };
    return AlpacaArray;
}());
module.exports = AlpacaArray;
