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
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var type_1 = require("./type");
var validators_1 = require("../helpers/validators");
var IdCast = function IdCast(value) {
    if (validators_1.default.isValidIdString(value)) {
        return mongoose_1.Types.ObjectId(value);
    }
    else {
        return null;
    }
};
var isValidIdOrNull = function isValidIdOrNull(val) {
    if (validators_1.default.isValidId(val) || val === null) {
        return true;
    }
    return false;
};
var AlpacaRef = /** @class */ (function (_super) {
    __extends(AlpacaRef, _super);
    function AlpacaRef(props) {
        var _this = _super.call(this, props) || this;
        _this.primitive = mongoose_1.Schema.Types.ObjectId;
        _this.castings.unshift(IdCast);
        _this.validators.unshift(isValidIdOrNull);
        return _this;
    }
    return AlpacaRef;
}(type_1.default));
exports.default = AlpacaRef;
