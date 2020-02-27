"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require('fs');
var hash = require('object-hash');
exports.storeData = function (path, data, isJson) {
    try {
        if (isJson) {
            var json_data = JSON.stringify(data, null, 2);
            fs.writeFileSync(path, json_data);
        }
        else {
            fs.writeFileSync(path, data);
        }
    }
    catch (err) {
        console.error(err);
    }
};
exports.loadData = function (path, isJson) {
    try {
        var data = fs.readFileSync(path, 'utf8');
        if (isJson) {
            return JSON.parse(data);
        }
        else {
            return data;
        }
    }
    catch (err) {
        console.error(err);
        return false;
    }
};
exports.saveIfChanged = function (filePath, toWrite, isJson) {
    if (isJson === void 0) { isJson = false; }
    if (!fs.existsSync(filePath)) {
        // file doesn't exist, so write it
        exports.storeData(filePath, toWrite, isJson);
    }
    else {
        var loadedData = exports.loadData(filePath, isJson);
        if (loadedData) {
            if (hash(loadedData) === hash(toWrite)) {
                // no change
            }
            else {
                exports.storeData(filePath, toWrite, isJson);
            }
        }
        else {
            exports.storeData(filePath, toWrite, isJson);
        }
    }
};
