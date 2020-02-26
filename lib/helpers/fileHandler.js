"use strict";
var fs = require('fs');
var hash = require('object-hash');
var storeData = function (path, data, isJson) {
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
var loadData = function (path, isJson) {
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
var saveIfChanged = function (filePath, toWrite, isJson) {
    if (!fs.existsSync(filePath)) {
        // file doesn't exist, so write it
        storeData(filePath, toWrite, isJson);
    }
    else {
        var loadedData = loadData(filePath, isJson);
        if (loadedData) {
            if (hash(loadedData) === hash(toWrite)) {
                // no change
            }
            else {
                storeData(filePath, toWrite, isJson);
            }
        }
        else {
            storeData(filePath, toWrite, isJson);
        }
    }
};
module.exports = {
    storeData: storeData,
    loadData: loadData,
    saveIfChanged: saveIfChanged,
};
