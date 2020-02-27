const express = require( "express" );
const mongoose = require( "mongoose" );
const bodyParser = require( "body-parser" );
const { AlpacaModel, AlpacaTypes, AlpacaValidators }  = require( "./lib/index" );
// const alpacas = require( "./app/models/_index" );
const path = require("path");

const mongoURI = process.env.MONGO_URI || "mongodb://localhost/alpackages_tests";
function connectWithRetry() {
  return mongoose.connect( mongoURI, ( err ) => {
    if ( err ) {
      console.error( "Failed to connect to mongo on startup - retrying in 5 sec", err.message );
      setTimeout( connectWithRetry, 5000 );
    } else {
      console.error( "Successfully connected to mongo - booting server." );
    }
  } );
}
connectWithRetry();

const app = express();

app.use( express.json( { limit: "5mb" } ) );
app.use( express.urlencoded( { extended: false } ) );

app.use( ( req, res, next ) => {
  console.log( req.body );
  next();
} );


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

const user = new AlpacaModel("User", {
  first_name: name,
  last_name: name,
  email: email,
}, options )


// app.use( "/api/user", alpacas.user.router );
// app.use( "/api/company", alpacas.company.router );
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

// @todo nested objects and arrays of objects

app.listen( 3000 );
