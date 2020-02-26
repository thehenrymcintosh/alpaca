"use strict";
var AlpacaType = /** @class */ (function () {
    function AlpacaType(props) {
        var _a, _b;
        this.primitive = String;
        this.null_or_non_empty_trimmed_string = true;
        this.validators = [];
        this.castings = [];
        if (typeof props === 'object' && props !== null) {
            var primitive = props.primitive, null_or_non_empty_trimmed_string = props.null_or_non_empty_trimmed_string, validators_1 = props.validators, castings = props.castings;
            if (typeof primitive !== 'undefined') {
                this.primitive = primitive;
            }
            if (typeof null_or_non_empty_trimmed_string !== 'undefined') {
                this.null_or_non_empty_trimmed_string = null_or_non_empty_trimmed_string;
            }
            if (typeof validators_1 !== 'undefined') {
                if (Array.isArray(validators_1)) {
                    (_a = this.validators).push.apply(_a, validators_1);
                }
                else {
                    this.validators.push(validators_1);
                }
            }
            if (typeof castings !== 'undefined') {
                if (Array.isArray(castings)) {
                    (_b = this.castings).push.apply(_b, castings);
                }
                else {
                    this.castings.push(castings);
                }
            }
        }
        // @todo improve developer experience by:
        // validating all the fields
        // add typescript defs for intellisense
    }
    AlpacaType.prototype.cast = function (value) {
        var alpaca = this;
        var valStore = value;
        for (var i = 0; i < this.castings.length; i++) {
            var castFunction = this.castings[i].bind(alpaca);
            valStore = castFunction(valStore);
        }
        return valStore;
    };
    AlpacaType.prototype.validate = function (value) {
        var alpaca = this;
        for (var i = 0; i < this.validators.length; i++) {
            var validationFunction = this.validators[i].bind(alpaca);
            if (!validationFunction(value)) {
                return false;
            }
        }
        return true;
    };
    return AlpacaType;
}());
module.exports = AlpacaType;
