"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AlpacaType = /** @class */ (function () {
    function AlpacaType(props) {
        var _a, _b;
        this.primitive = String;
        this.null_or_non_empty_trimmed_string = true;
        this.validators = [];
        this.castings = [];
        if (typeof props === 'object' && props !== null) {
            var primitive = props.primitive, null_or_non_empty_trimmed_string = props.null_or_non_empty_trimmed_string, validate = props.validate, cast = props.cast;
            if (typeof primitive !== 'undefined') {
                this.primitive = primitive;
            }
            if (typeof null_or_non_empty_trimmed_string !== 'undefined') {
                this.null_or_non_empty_trimmed_string = null_or_non_empty_trimmed_string;
            }
            if (typeof validate !== 'undefined') {
                if (Array.isArray(validate)) {
                    (_a = this.validators).push.apply(_a, validate);
                }
                else {
                    this.validators.push(validate);
                }
            }
            if (typeof cast !== 'undefined') {
                if (Array.isArray(cast)) {
                    (_b = this.castings).push.apply(_b, cast);
                }
                else {
                    this.castings.push(cast);
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
exports.default = AlpacaType;
