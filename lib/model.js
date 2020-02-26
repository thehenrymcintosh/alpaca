"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var mongoose = require("mongoose");
var express = require("express");
var _a = require("./helpers/modelHelpers"), primitiveToString = _a.primitiveToString, extractType = _a.extractType;
var _b = require("./types/_index"), AlpacaArray = _b.AlpacaArray, AlpacaDate = _b.AlpacaDate, AlpacaType = _b.AlpacaType;
var validators = require("./helpers/validators");
var fileHandler = require("./helpers/fileHandler");
var fs = require('fs');
var path = require("path");
var compile = require('json-schema-to-typescript').compile;
var GlobalModelStore = {};
var LastModified = new AlpacaDate({ castings: function () { return new Date(); } });
var CreatedAt = new AlpacaDate();
function getModelByName(name) {
    return GlobalModelStore[name.toLowerCase()];
}
var AlpacaModel = /** @class */ (function () {
    function AlpacaModel(name, props, options) {
        if (options === void 0) { options = {}; }
        if (getModelByName(name))
            throw new Error("Model names must be unique!");
        this.name = name;
        if (name.indexOf(" ") >= 0)
            throw new Error("Model names cannot contain spaces! '" + name + "'");
        this.locals_name = name.toLowerCase();
        this.id_name = name.toLowerCase() + "_id";
        this.raw_model = __assign({}, props);
        this.options = options;
        if (this.options.timestamps) {
            this.raw_model.last_modified_at = LastModified;
            this.raw_model.created_at = { type: CreatedAt, readOnly: true };
        }
        this.populators = [];
        this.nestedRoutes = [];
        if (this.options.generateOpenApi) {
            this.generateOpenApi();
        }
        if (this.options.generateTs) {
            this.generateTs();
        }
        if (!this.options.manualInit) {
            this.generateMongoose();
            this.generateRouter();
        }
        GlobalModelStore[name.toLowerCase()] = this;
    }
    AlpacaModel.prototype.generateRouter = function () {
        var _this = this;
        var alpaca = this;
        this.router = express.Router();
        var alpacaMountMiddleware = this.getAlpacaMountMiddleware();
        this.router.use(alpacaMountMiddleware);
        this.router.get("/", alpaca.index);
        this.router.get("/:" + this.id_name, alpaca.read);
        this.router.post("/", alpaca.create);
        this.router.post("/:" + this.id_name, alpaca.update);
        this.router.delete("/:" + this.id_name, alpaca.destroy);
        if (validators.isValidArray(this.options.nestedRest)) {
            this.options.nestedRest.forEach(function (route) {
                _this.router.get("/:" + _this.id_name + "/" + route.path, function (req, res, next) {
                    var query = {};
                    var id = req.params[_this.id_name];
                    query["" + route.foreignField] = id;
                    if (!validators.isValidIdString(id))
                        throw new Error("Invalid id: " + id);
                    var foreignModel = getModelByName(route.modelName);
                    foreignModel.model.find(query)
                        .populate(foreignModel.populators.join(" "))
                        .exec()
                        .then(function (docs) {
                        res.locals[route.modelName.toLowerCase() + "s"] = docs;
                        next();
                    })
                        .catch(next);
                });
            });
        }
        this.nestedRoutes.forEach(function (route) {
            _this.router[route.method]("/:" + _this.id_name + "/" + route.path, route.middleware);
        });
    };
    AlpacaModel.prototype.pushNestedRoute = function (method, path, middleware) {
        var allowedMethods = ["get", "put", "post", "delete", "use"];
        if (!validators.isValidName(method))
            throw new Error("Method must be valid text");
        if (allowedMethods.indexOf(method) === -1)
            throw new Error("Method must be one of: " + allowedMethods.join(" "));
        if (!validators.isValidName(path))
            throw new Error("Path must be valid text");
        if (path.charAt(0) === "/")
            throw new Error("Path should not start with /");
        if (!validators.isValidFunction(middleware) && !validators.isValidArray(middleware))
            throw new Error("Middleware should be a function or array of functions");
        this.nestedRoutes.push({
            method: method,
            path: path,
            middleware: middleware,
        });
        this.generateRouter();
    };
    AlpacaModel.prototype.generateMongoose = function () {
        var _this = this;
        var modelKeys = Object.keys(this.raw_model);
        this.mongooseTemplate = {};
        var alpaca = this;
        modelKeys.forEach(function (modelKey) {
            var modelValue = _this.raw_model[modelKey];
            var _a = extractType(modelValue), rawObject = _a.rawObject, isAlpacaArray = _a.isAlpacaArray, type = _a.type;
            var newMongooseProp = { required: true };
            newMongooseProp.type = type.primitive;
            if (rawObject) {
                if (rawObject.ref)
                    newMongooseProp.ref = rawObject.ref;
                if (rawObject.populate && rawObject.ref)
                    alpaca.populators.push(modelKey);
                if (validators.isValidBool(rawObject.required))
                    newMongooseProp.required = rawObject.required;
            }
            if (isAlpacaArray) {
                _this.mongooseTemplate[modelKey] = [newMongooseProp];
            }
            else {
                _this.mongooseTemplate[modelKey] = newMongooseProp;
            }
        });
        var schema = new mongoose.Schema(this.mongooseTemplate);
        this.model = mongoose.model(this.name, schema);
    };
    AlpacaModel.prototype.getOpenApiProperties = function () {
        var _this = this;
        var toWrite = {
            title: this.name,
            properties: {},
        };
        var required = [];
        if (tags)
            toWrite.tags = tags;
        var modelKeys = Object.keys(this.raw_model);
        modelKeys.forEach(function (modelKey) {
            var modelValue = _this.raw_model[modelKey];
            var _a = extractType(modelValue), rawObject = _a.rawObject, type = _a.type, isAlpacaArray = _a.isAlpacaArray;
            var isRequired = true;
            if (rawObject && validators.isValidBool(rawObject.required))
                isRequired = rawObject.required;
            if (rawObject && rawObject.populate && validators.isValidName(rawObject.ref) && getModelByName(rawObject.ref.toLowerCase())) {
                if (isAlpacaArray) {
                    toWrite.properties[modelKey] = { items: getModelByName(rawObject.ref).getOpenApiProperties() };
                }
                else {
                    toWrite.properties[modelKey] = getModelByName(rawObject.ref).getOpenApiProperties();
                }
            }
            else {
                if (isAlpacaArray) {
                    toWrite.properties[modelKey] = { items: { type: primitiveToString(type.primitive), } };
                }
                else {
                    toWrite.properties[modelKey] = { type: primitiveToString(type.primitive), };
                }
            }
            if (rawObject && rawObject.example)
                toWrite.properties[modelKey].example = rawObject.example;
            if (isRequired)
                required.push(modelKey);
        });
        if (required.length > 0)
            toWrite.required = required;
        return toWrite;
    };
    AlpacaModel.prototype.generateOpenApi = function (newOptions) {
        if (newOptions && validators.isValidObject(newOptions))
            this.options.generateOpenApi = newOptions;
        var _a = this.options.generateOpenApi, dir = _a.dir, tags = _a.tags;
        if (!validators.isValidText(dir))
            throw new Error("'options.generateOpenApi.dir' must be a valid path string for the output directory!");
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        var filePath = path.join(dir, this.name + ".json");
        this.options.generateOpenApi.filePath = filePath;
        var toWrite = this.getTsProperties();
        fileHandler.saveIfChanged(filePath, toWrite, true);
    };
    // @todo fix infinite recursion of definitions with references
    AlpacaModel.prototype.getTsProperties = function () {
        var _this = this;
        var additionalProperties = this.options.generateTs.additionalProperties;
        var required = [];
        var toWrite = {
            title: this.name,
            type: "object",
            properties: {},
        };
        if (validators.isValidBool(additionalProperties))
            toWrite.additionalProperties = additionalProperties;
        var modelKeys = Object.keys(this.raw_model);
        modelKeys.forEach(function (modelKey) {
            var modelValue = _this.raw_model[modelKey];
            var _a = extractType(modelValue), isAlpacaArray = _a.isAlpacaArray, rawObject = _a.rawObject, type = _a.type;
            var isRequired = true;
            if (rawObject && validators.isValidBool(rawObject.required))
                isRequired = rawObject.required;
            if (rawObject && rawObject.populate && validators.isValidName(rawObject.ref) && getModelByName(rawObject.ref.toLowerCase())) {
                if (isAlpacaArray) {
                    toWrite.properties[modelKey] = { items: getModelByName(rawObject.ref).getTsProperties() };
                }
                else {
                    toWrite.properties[modelKey] = getModelByName(rawObject.ref).getTsProperties();
                }
            }
            else {
                if (isAlpacaArray) {
                    toWrite.properties[modelKey] = { items: { type: primitiveToString(type.primitive), } };
                }
                else {
                    toWrite.properties[modelKey] = { type: primitiveToString(type.primitive), };
                }
            }
            if (rawObject && rawObject.description)
                toWrite.properties[modelKey].description = rawObject.description;
            if (rawObject && rawObject.enum && validators.isValidArray(rawObject.enum))
                toWrite.properties[modelKey].enum = rawObject.enum;
            if (isRequired)
                required.push(modelKey);
        });
        if (required.length > 0)
            toWrite.required = required;
        return toWrite;
    };
    AlpacaModel.prototype.generateTs = function (newOptions) {
        if (newOptions && validators.isValidObject(newOptions))
            this.options.generateTs = newOptions;
        var dir = this.options.generateTs.dir;
        if (!validators.isValidText(dir))
            throw new Error("'options.generateTs.dir' must be a valid path string for the output directory!");
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        var filePath = path.join(dir, this.name + ".ts");
        this.options.generateTs.filePath = filePath;
        var toWrite = this.getTsProperties();
        compile(toWrite, toWrite.title, {
            bannerComment: "/* tslint:disable */\n/**\n* This file was automatically generated by json-schema-to-typescript in Alpaca.\n* DO NOT MODIFY IT BY HAND. Instead, modify the Alpaca model and this will regenerate the next time the server starts.\n*/"
        })
            .then(function (ts) {
            fileHandler.saveIfChanged(filePath, ts);
        });
    };
    AlpacaModel.prototype.cast = function (body) {
        var _this = this;
        if (body === void 0) { body = {}; }
        var modelKeys = Object.keys(this.raw_model);
        var newBody = {};
        modelKeys.forEach(function (modelKey) {
            var modelValue = _this.raw_model[modelKey];
            var _a = extractType(modelValue), rawObject = _a.rawObject, typeOrArray = _a.typeOrArray;
            if (!(rawObject && rawObject.readOnly)) {
                newBody[modelKey] = typeOrArray.cast(body[modelKey]);
            }
        });
        return newBody;
    };
    AlpacaModel.prototype.validate = function (body) {
        var _this = this;
        var modelKeys = Object.keys(this.raw_model);
        modelKeys.forEach(function (modelKey) {
            var modelValue = _this.raw_model[modelKey];
            var _a = extractType(modelValue), rawObject = _a.rawObject, typeOrArray = _a.typeOrArray;
            if (rawObject && rawObject.readOnly) {
                if (typeof body[modelKey] !== "undefined")
                    throw new Error(_this.name + " " + modelKey + " is read-only");
            }
            else {
                var required = true;
                if (rawObject && validators.isValidBool(rawObject.required))
                    required = rawObject.required;
                if (!typeOrArray.validate(body[modelKey]))
                    throw new Error("Invalid " + _this.name + " " + modelKey + ": " + body[modelKey]);
                if (!body[modelKey] && required)
                    throw new Error(_this.name + " " + modelKey + " is required");
            }
        });
    };
    AlpacaModel.prototype.getAlpacaMountMiddleware = function () {
        var alpaca = this;
        return function (req, res, next) {
            req.alpaca = alpaca;
            next();
        };
    };
    AlpacaModel.prototype.read = function (req, res, next) {
        var alpaca = req.alpaca;
        var id = req.params[alpaca.id_name];
        if (!validators.isValidIdString(id))
            throw new Error("Invalid id: " + id);
        alpaca.model.findById(id)
            .populate(alpaca.populators.join(" "))
            .exec()
            .then(function (doc) {
            res.locals[alpaca.locals_name] = doc;
            next();
        })
            .catch(next);
    };
    AlpacaModel.prototype.index = function (req, res, next) {
        var alpaca = req.alpaca;
        alpaca.model.find()
            .populate(alpaca.populators.join(" "))
            .exec()
            .then(function (docs) {
            res.locals[alpaca.locals_name + "s"] = docs;
            next();
        })
            .catch(next);
    };
    AlpacaModel.prototype.create = function (req, res, next) {
        var alpaca = req.alpaca;
        var body = req.body;
        var cast = alpaca.cast(body);
        alpaca.validate(cast);
        if (alpaca.options.timestamps) {
            cast.created_at = new Date();
        }
        alpaca.model.create(cast)
            .then(function (doc) {
            res.locals[alpaca.locals_name] = doc;
            next();
        })
            .catch(next);
    };
    AlpacaModel.prototype.update = function (req, res, next) {
        var alpaca = req.alpaca;
        var id = req.params[alpaca.id_name];
        if (!validators.isValidIdString(id))
            throw new Error("Invalid id: " + id);
        var body = req.body;
        var cast = alpaca.cast(body);
        alpaca.validate(cast);
        alpaca.model.findByIdAndUpdate(id, cast, { new: true, useFindAndModify: false })
            .then(function (doc) {
            res.locals[alpaca.locals_name] = doc;
            next();
        })
            .catch(next);
    };
    AlpacaModel.prototype.destroy = function (req, res, next) {
        var alpaca = req.alpaca;
        var id = req.params[alpaca.id_name];
        if (!validators.isValidIdString(id))
            throw new Error("Invalid id: " + id);
        alpaca.model.findByIdAndRemove(id)
            .then(function (doc) {
            res.locals[alpaca.locals_name] = doc;
            next();
        })
            .catch(next);
    };
    return AlpacaModel;
}());
module.exports = AlpacaModel;
