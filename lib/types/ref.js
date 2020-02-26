"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var AlpacaType = require("./type");
var validators = require("../helpers/validators");
var mongoose = require("mongoose");
function IdCast(value) {
    if (validators.isValidIdString(value)) {
        return mongoose.Types.ObjectId(value);
    }
    else {
        return null;
    }
}
function isValidIdOrNull(val) {
    if (validators.isValidId(val) || val === null) {
        return true;
    }
    return false;
}
module.exports = /** @class */ (function (_super) {
    __extends(AlpacaRef, _super);
    function AlpacaRef(props) {
        var _this = _super.call(this, props) || this;
        _this.primitive = mongoose.Schema.Types.ObjectId;
        _this.castings.unshift(IdCast);
        _this.validators.unshift(isValidIdOrNull);
        return _this;
    }
    return AlpacaRef;
}(AlpacaType));
