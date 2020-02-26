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
function toDate(val) {
    if (val === "" || typeof val === "undefined") {
        return null;
    }
    if (validators.isValidDate(val)) {
        return val;
    }
    var parsed = new Date(val);
    if (parsed.toString() === "Invalid Date") {
        return null;
    }
    return parsed;
}
module.exports = /** @class */ (function (_super) {
    __extends(AlpacaDate, _super);
    function AlpacaDate(props) {
        var _this = _super.call(this, props) || this;
        _this.primitive = Date;
        _this.castings.unshift(toDate);
        return _this;
    }
    return AlpacaDate;
}(AlpacaType));
