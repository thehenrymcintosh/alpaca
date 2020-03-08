# Alpacas!
A single-source-of-truth for Express / Mongodb APIs, with auto-generated documentation, routes,mongoose models, type casting and validation and more.


## Getting Started

### Prerequisites

This assumes you have nodejs and a mongodb instance available.

### Installing

Add `alpacas` as a depency of your project, along with `express` and `mongoose`.

```
npm install --save alpacas express mongoose
```

Add some boilerplate code

```Javascript
// index.js

const express = require( "express" );
const mongoose = require( "mongoose" );
const { AlpacaModel, AlpacaTypes, AlpacaValidators }  = require( "./lib/index" );

const mongoURI = process.env.MONGO_URI || "mongodb://localhost/alpacas";
mongoose.connect( mongoURI );
const app = express();

app.use( express.json( { limit: "5mb" } ) );
app.use( express.urlencoded( { extended: false } ) );


const { AlpacaString, AlpacaDate, AlpacaInt, AlpacaArray, AlpacaReference } = AlpacaTypes;
const options = {
  timestamps: true,
  generateTs: {
    dir: path.join( __dirname, ".", "docs", "ts" ),
  },
  generateOpenApi: {
    dir: path.join( __dirname, ".", "docs", "ts" ),
  }
}

const name = new AlpacaString( { 
  validate: (name) => name && name.length < 20 
} )

const email = new AlpacaString( { 
  validate: AlpacaValidators.isValidEmail 
} )
const ref = new AlpacaReference();
const options = {
  timestamps: true,
  generateTs: {
    dir: path.join( __dirname, ".", "docs", "ts" ),
  },
  generateOpenApi: {
    dir: path.join( __dirname, ".", "docs", "ts" ),
  },
}
const company = new AlpacaModel("Company", {
  name: name,
}, {
  ...options,
  nestedRest: [{path:"users",foreignField:"company",modelName:"User"}]
})

const user = new AlpacaModel("User", {
  first_name: name,
  last_name: name,
  email: {
    type: email,
    required: true,
    description: "email address",
    example: "test@test.com",
  },
  company: {
    type: new AlpacaArray( ref ),
    ref: "Company",
    populate: true,
  }
}, options )


app.use( "/api/company", company.router );
app.use( "/api/user", user.router );

app.use( ( req, res ) => {
  res.json( res.locals );
} );

app.use( ( err, req, res, next ) => {
  res.json( {
    error: err.message,
    trace: err.stack,
  } );
} );

app.listen( 3000 );

```

When you start the app, you'll get working crud routes at /api/user and /api/company. The following table shows the default routes for an example model:

| Route name  | URL |  HTTP Verb |
| ----------- | --- | ---------- |
| Create      | /api/model      | POST   |
| Index       | /api/model      | GET    |
| Read        | /api/model/:id  | GET    |
| Update      | /api/model/:id  | POST   | 
| Delete      | /api/model/:id  | DELETE |

## Configuration

There are three main exports from Alpacas. The AlpacaModel, AlpacaTypes, and AlpacaValidators. 

### AlpacaValidators

AlpacaValidators are a set of validation functions for a range of different scenarios.

### AlpacaTypes

AlpacaTypes are a bunch of different classes which inherit from the base AlpacaType, such as AlpacaString, or AlpacaInt. The constructor takes an object with two main properties: "validate" and "cast" which are both functions or arrays of functions. 

Validation functions take any type and return a boolean indicating if the input passed validation. 

Cast functions take any type and transform it, passing it to the next cast function. 

Types also have a primitive, which can be overwritten by setting the "primitive" property in the object passed to the constructor. Any valid type for a Mongoose model field will work. 

```TypeScript
type AlapacaPrimitive = StringConstructor | NumberConstructor | DateConstructor | typeof Schema.Types.ObjectId;
type AlpacaValidator = ((value: any) => boolean);
type AlpacaCaster = ((value: any) => any)
interface AlpacaTypeOptions {
  primitive?: AlapacaPrimitive
  null_or_non_empty_trimmed_string?: boolean
  validate?: AlpacaValidator | AlpacaValidator[]
  cast?: AlpacaCaster | AlpacaCaster[]
}
```

### AlpacaModel

AlpacaModels are the main workhorse of the library. The constructor functions take 3 inputs, the model name, the schema, and an optional object of AlpacaModelOptions.

```TypeScript
interface AlpacaSchema {
  [key: string]: AlpacaModelProp,
}

interface AlpacaModelProp {
  type: AlpacaType | AlpacaArray
  ref?: string
  populate?: boolean
  required?: boolean
  readOnly?: boolean
  example?: any
  description?: string
  enum?: any[]
}

interface AlpacaModelTSOptions {
  dir: string
  filePath?: string
  additionalProperties?: boolean
}

interface AlpacaModelOpenAPIOptions {
  dir: string
  filePath?: string
  tags?: string[]
}

interface AlpacaNestedRestOptions {
  path: string
  foreignField: string
  modelName: string
}

interface AlpacaModelOptions {
  manualInit?: boolean;
  generateTs?: AlpacaModelTSOptions;
  generateOpenApi?: AlpacaModelOpenAPIOptions;
  nestedRest?:AlpacaNestedRestOptions[];
  timestamps?: boolean;
  schemaCallback?: (( Schema: Schema ) => void )
}
```

The key properties on the AlpacaModel are `router`, which is an Express router with the default crud routes; and `model`, which is the mongoose model instance. Other important ones are `cast` and `validate`, which act similarly to the methods on the AlpacaType. Other important properties are the crud middleware methods `read`, `index`, `create`, `update`, `destroy` and `getAlpacaMountMiddleware()`.

You can add a nested http method using the following method
`pushNestedRoute( method:nestedRouteAllowedMethods, path:string, middleware:middleware )`

The mongoose schema can be accessed in the schemaCallback function, if provided in the options. This can be used to add indexes, static methods, etc, before the model is created.

## Built With

* [Express Js](https://github.com/expressjs/express) - The web framework used
* [Mongoose](https://github.com/Automattic/mongoose) - Mongodb ORM

## Contributing

This is not yet open for public contribution. If you find any bugs or wish to request a feature, please [add to any existing relevant tickets](https://github.com/thehenrymcintosh/alpaca/issues) or [add your own bug or feature request](https://github.com/thehenrymcintosh/alpaca/issues/new).

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/thehenrymcintosh/alpaca/tags). 

## Authors

* **Henry Mcintosh** 

See also the list of [contributors](https://github.com/thehenrymcintosh/alpaca/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
