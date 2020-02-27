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
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var express_1 = require("express");
var modelHelpers_1 = require("./helpers/modelHelpers");
var _index_1 = require("./types/_index");
var validators_1 = require("./helpers/validators");
var fileHandler_1 = require("./helpers/fileHandler");
var fs = require('fs');
var path = require("path");
var compile = require('json-schema-to-typescript').compile;
var GlobalModelStore = {};
var RODate = new _index_1.AlpacaDate();
function getModelByName(name) {
    var model = GlobalModelStore[name.toLowerCase()];
    if (model)
        return model;
    return null;
}
var AlpacaModel = /** @class */ (function () {
    function AlpacaModel(name, props, options) {
        if (options === void 0) { options = {}; }
        this.mongooseTemplate = {};
        this.options = {};
        this.nestedRoutes = [];
        this.getAlpacaMountMiddleware = function () {
            var alpaca = this;
            return function (req, res, next) {
                req.alpaca = alpaca;
                next();
            };
        };
        this.read = function (req, res, next) {
            var alpaca = req.alpaca;
            if (!alpaca || typeof alpaca.model === "undefined")
                throw new Error("Alpaca model not initialised");
            var id = req.params[alpaca.id_name];
            if (!validators_1.default.isValidIdString(id))
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
        this.index = function (req, res, next) {
            var alpaca = req.alpaca;
            if (!alpaca || typeof alpaca.model === "undefined")
                throw new Error("Alpaca model not initialised");
            alpaca.model.find()
                .populate(alpaca.populators.join(" "))
                .exec()
                .then(function (docs) {
                res.locals[alpaca.locals_name + "s"] = docs;
                next();
            })
                .catch(next);
        };
        this.create = function (req, res, next) {
            var alpaca = req.alpaca;
            if (!alpaca || typeof alpaca.model === "undefined")
                throw new Error("Alpaca model not initialised");
            var body = req.body;
            var cast = alpaca.cast(body);
            alpaca.validate(cast);
            alpaca.model.create(cast)
                .then(function (doc) {
                res.locals[alpaca.locals_name] = doc;
                next();
            })
                .catch(next);
        };
        this.update = function (req, res, next) {
            var alpaca = req.alpaca;
            if (!alpaca || typeof alpaca.model === "undefined")
                throw new Error("Alpaca model not initialised");
            var id = req.params[alpaca.id_name];
            if (!validators_1.default.isValidIdString(id))
                throw new Error("Invalid id: " + id);
            var body = req.body;
            var cast = alpaca.cast(body);
            alpaca.validate(cast);
            alpaca.model.findByIdAndUpdate(id, cast, { new: true })
                .then(function (doc) {
                res.locals[alpaca.locals_name] = doc;
                next();
            })
                .catch(next);
        };
        this.destroy = function (req, res, next) {
            var alpaca = req.alpaca;
            if (!alpaca || typeof alpaca.model === "undefined")
                throw new Error("Alpaca model not initialised");
            var id = req.params[alpaca.id_name];
            if (!validators_1.default.isValidIdString(id))
                throw new Error("Invalid id: " + id);
            alpaca.model.findByIdAndRemove(id)
                .then(function (doc) {
                res.locals[alpaca.locals_name] = doc;
                next();
            })
                .catch(next);
        };
        if (getModelByName(name))
            throw new Error("Model names must be unique!");
        this.name = name;
        if (name.indexOf(" ") >= 0)
            throw new Error("Model names cannot contain spaces! '" + name + "'");
        this.locals_name = name.toLowerCase();
        this.id_name = name.toLowerCase() + "_id";
        this.raw_model = __assign({}, props);
        this.options = options;
        // @todo use mongodb native timestamps
        // @todo add mongoose options to pass to schema
        this.raw_model._id = { type: new _index_1.AlpacaReference(), readOnly: true };
        if (this.options.timestamps) {
            this.raw_model.updatedAt = { type: RODate, readOnly: true };
            this.raw_model.createdAt = { type: RODate, readOnly: true };
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
        this.getAlpacaMountMiddleware = this.getAlpacaMountMiddleware.bind(this);
        GlobalModelStore[name.toLowerCase()] = this;
    }
    AlpacaModel.prototype.generateRouter = function () {
        var _this = this;
        var alpaca = this;
        var router = express_1.Router();
        var alpacaMountMiddleware = this.getAlpacaMountMiddleware();
        router.use(alpacaMountMiddleware);
        router.get("/", alpaca.index);
        router.get("/:" + this.id_name, alpaca.read);
        router.post("/", alpaca.create);
        router.post("/:" + this.id_name, alpaca.update);
        router.delete("/:" + this.id_name, alpaca.destroy);
        if (typeof this.options.nestedRest !== "undefined" && validators_1.default.isValidArray(this.options.nestedRest)) {
            this.options.nestedRest.forEach(function (route) {
                router.get("/:" + _this.id_name + "/" + route.path, function (req, res, next) {
                    var query = {};
                    var id = req.params[_this.id_name];
                    query["" + route.foreignField] = id;
                    if (!validators_1.default.isValidIdString(id))
                        throw new Error("Invalid id: " + id);
                    var foreignModel = getModelByName(route.modelName);
                    if (foreignModel === null)
                        throw new Error("No foreign model");
                    if (typeof foreignModel.model === "undefined")
                        throw new Error("No initalized foreign model");
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
            router[route.method]("/:" + _this.id_name + "/" + route.path, route.middleware);
        });
        this.router = router;
    };
    AlpacaModel.prototype.pushNestedRoute = function (method, path, middleware) {
        var allowedMethods = ["get", "put", "post", "delete", "use"];
        if (!validators_1.default.isValidName(method))
            throw new Error("Method must be valid text");
        if (allowedMethods.indexOf(method) === -1)
            throw new Error("Method must be one of: " + allowedMethods.join(" "));
        if (!validators_1.default.isValidName(path))
            throw new Error("Path must be valid text");
        if (path.charAt(0) === "/")
            throw new Error("Path should not start with /");
        if (!validators_1.default.isValidFunction(middleware) && !validators_1.default.isValidArray(middleware))
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
        this.mongooseTemplate;
        var alpaca = this;
        modelKeys.forEach(function (modelKey) {
            var modelValue = _this.raw_model[modelKey];
            var _a = modelHelpers_1.extractType(modelValue), rawObject = _a.rawObject, isAlpacaArray = _a.isAlpacaArray, type = _a.type;
            var newMongooseProp = { required: true };
            newMongooseProp.type = type.primitive;
            if (rawObject) {
                if (rawObject.ref)
                    newMongooseProp.ref = rawObject.ref;
                if (rawObject.populate && rawObject.ref)
                    alpaca.populators.push(modelKey);
                if (validators_1.default.isValidBool(rawObject.required))
                    newMongooseProp.required = rawObject.required;
            }
            if (isAlpacaArray) {
                _this.mongooseTemplate[modelKey] = [newMongooseProp];
            }
            else {
                _this.mongooseTemplate[modelKey] = newMongooseProp;
            }
        });
        var schemaOptions = {};
        if (typeof alpaca.options.timestamps === "boolean") {
            schemaOptions.timestamps = alpaca.options.timestamps;
        }
        var schema = new mongoose_1.Schema(this.mongooseTemplate);
        this.model = new mongoose_1.model(this.name, schema);
    };
    AlpacaModel.prototype.getOpenApiProperties = function () {
        var _this = this;
        var toWrite = {
            title: this.name,
            properties: {},
            required: [],
            tags: [],
        };
        var required = [];
        var modelKeys = Object.keys(this.raw_model);
        modelKeys.forEach(function (modelKey) {
            var modelValue = _this.raw_model[modelKey];
            var _a = modelHelpers_1.extractType(modelValue), rawObject = _a.rawObject, type = _a.type, isAlpacaArray = _a.isAlpacaArray;
            var isRequired = true;
            if (rawObject && typeof rawObject.required === "boolean")
                isRequired = rawObject.required;
            if (rawObject && rawObject.populate && rawObject.ref && validators_1.default.isValidName(rawObject.ref) && getModelByName(rawObject.ref.toLowerCase())) {
                var foreignModel = getModelByName(rawObject.ref);
                if (foreignModel === null)
                    throw new Error("Foreign model does not exist");
                if (isAlpacaArray) {
                    toWrite.properties[modelKey] = { items: foreignModel.getOpenApiProperties() };
                }
                else {
                    toWrite.properties[modelKey] = foreignModel.getOpenApiProperties();
                }
            }
            else {
                if (isAlpacaArray) {
                    toWrite.properties[modelKey] = { items: { type: modelHelpers_1.primitiveToString(type.primitive), } };
                }
                else {
                    toWrite.properties[modelKey] = { type: modelHelpers_1.primitiveToString(type.primitive), };
                }
            }
            if (rawObject && typeof rawObject.example !== "undefined")
                toWrite.properties[modelKey].example = rawObject.example;
            if (rawObject && typeof rawObject.readOnly !== "undefined")
                toWrite.properties[modelKey].readOnly = rawObject.readOnly;
            if (isRequired)
                required.push(modelKey);
        });
        if (required.length > 0)
            toWrite.required = required;
        return toWrite;
    };
    AlpacaModel.prototype.generateOpenApi = function (newOptions) {
        if (newOptions && validators_1.default.isValidObject(newOptions))
            this.options.generateOpenApi = newOptions;
        if (!this.options.generateOpenApi)
            throw new Error("Openapi options are not set");
        var _a = this.options.generateOpenApi, dir = _a.dir, tags = _a.tags;
        if (!validators_1.default.isValidText(dir))
            throw new Error("'options.generateOpenApi.dir' must be a valid path string for the output directory!");
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        var filePath = path.join(dir, this.name + ".json");
        this.options.generateOpenApi.filePath = filePath;
        var toWrite = this.getOpenApiProperties();
        if (tags)
            toWrite.tags = tags;
        fileHandler_1.saveIfChanged(filePath, toWrite, true);
    };
    // @todo fix infinite recursion of definitions with references
    AlpacaModel.prototype.getTsProperties = function () {
        var _this = this;
        if (!this.options.generateTs)
            throw new Error("Typescript options are not set");
        var additionalProperties = this.options.generateTs.additionalProperties;
        var required = [];
        var toWrite = {
            title: this.name,
            type: "object",
            properties: {},
            additionalProperties: false,
            required: [],
        };
        if (typeof additionalProperties === "boolean")
            toWrite.additionalProperties = additionalProperties;
        var modelKeys = Object.keys(this.raw_model);
        modelKeys.forEach(function (modelKey) {
            var modelValue = _this.raw_model[modelKey];
            var _a = modelHelpers_1.extractType(modelValue), isAlpacaArray = _a.isAlpacaArray, rawObject = _a.rawObject, type = _a.type;
            var isRequired = true;
            if (rawObject && typeof rawObject.required === "boolean")
                isRequired = rawObject.required;
            if (rawObject && rawObject.populate && rawObject.ref && validators_1.default.isValidName(rawObject.ref) && getModelByName(rawObject.ref.toLowerCase())) {
                var foreignModel = getModelByName(rawObject.ref);
                if (foreignModel === null)
                    throw new Error("Foreign model does not exist");
                if (isAlpacaArray) {
                    toWrite.properties[modelKey] = { items: foreignModel.getTsProperties() };
                }
                else {
                    toWrite.properties[modelKey] = foreignModel.getTsProperties();
                }
            }
            else {
                if (isAlpacaArray) {
                    toWrite.properties[modelKey] = { items: { type: modelHelpers_1.primitiveToString(type.primitive), } };
                }
                else {
                    toWrite.properties[modelKey] = { type: modelHelpers_1.primitiveToString(type.primitive), };
                }
            }
            if (rawObject && rawObject.description)
                toWrite.properties[modelKey].description = rawObject.description;
            if (rawObject && rawObject.enum && validators_1.default.isValidArray(rawObject.enum))
                toWrite.properties[modelKey].enum = rawObject.enum;
            if (isRequired)
                required.push(modelKey);
        });
        if (required.length > 0)
            toWrite.required = required;
        return toWrite;
    };
    AlpacaModel.prototype.generateTs = function (newOptions) {
        if (newOptions && validators_1.default.isValidObject(newOptions))
            this.options.generateTs = newOptions;
        if (!this.options.generateTs)
            throw new Error("Typescript options are not");
        var dir = this.options.generateTs.dir;
        if (!validators_1.default.isValidText(dir))
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
            fileHandler_1.saveIfChanged(filePath, ts);
        });
    };
    AlpacaModel.prototype.cast = function (body) {
        var _this = this;
        if (body === void 0) { body = {}; }
        var modelKeys = Object.keys(this.raw_model);
        var newBody = {};
        modelKeys.forEach(function (modelKey) {
            var modelValue = _this.raw_model[modelKey];
            var _a = modelHelpers_1.extractType(modelValue), rawObject = _a.rawObject, typeOrArray = _a.typeOrArray;
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
            var _a = modelHelpers_1.extractType(modelValue), rawObject = _a.rawObject, typeOrArray = _a.typeOrArray;
            if (rawObject && rawObject.readOnly) {
                if (typeof body[modelKey] !== "undefined")
                    throw new Error(_this.name + " " + modelKey + " is read-only");
            }
            else {
                var required = true;
                if (rawObject && typeof rawObject.required === "boolean")
                    required = rawObject.required;
                if (!typeOrArray.validate(body[modelKey]))
                    throw new Error("Invalid " + _this.name + " " + modelKey + ": " + body[modelKey]);
                if (!body[modelKey] && required)
                    throw new Error(_this.name + " " + modelKey + " is required");
            }
        });
    };
    return AlpacaModel;
}());
exports.default = AlpacaModel;
