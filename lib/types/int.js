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
function toInt(val) {
    if (val === "" || typeof val === "undefined") {
        return null;
    }
    var parsed = parseInt(val, 10);
    if (isNaN(parsed))
        return null;
    return parsed;
}
module.exports = /** @class */ (function (_super) {
    __extends(AlpacaInt, _super);
    function AlpacaInt(props) {
        var _this = _super.call(this, props) || this;
        _this.primitive = Number;
        _this.castings.unshift(toInt);
        return _this;
    }
    return AlpacaInt;
}(AlpacaType));
