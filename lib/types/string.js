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
function strCast(value) {
    if (this.null_or_non_empty_trimmed_string) {
        if (!value || value.trim().length === 0) {
            return null;
        }
        else {
            return value;
        }
    }
    return value;
}
module.exports = /** @class */ (function (_super) {
    __extends(AlpacaString, _super);
    function AlpacaString(props) {
        var _this = _super.call(this, props) || this;
        _this.castings.unshift(strCast);
        return _this;
    }
    return AlpacaString;
}(AlpacaType));
