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
var type_1 = require("./type");
var validators_1 = require("../helpers/validators");
var toDate = function toDate(val) {
    if (val === "" || typeof val === "undefined") {
        return null;
    }
    if (validators_1.default.isValidDate(val)) {
        return val;
    }
    var parsed = new Date(val);
    if (parsed.toString() === "Invalid Date") {
        return null;
    }
    return parsed;
};
var AlpacaDate = /** @class */ (function (_super) {
    __extends(AlpacaDate, _super);
    function AlpacaDate(props) {
        var _this = _super.call(this, props) || this;
        _this.primitive = Date;
        _this.castings.unshift(toDate);
        return _this;
    }
    return AlpacaDate;
}(type_1.default));
exports.default = AlpacaDate;
