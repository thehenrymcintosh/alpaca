const { Name } = require( "../types/_index" );
const { Types } = require( "../../lib/index" );

const {
  AlpacaString, AlpacaInt, AlpacaReference, AlpacaArray, AlpacaDate,
} = Types;
const name = new Name();
const ref = new AlpacaReference();

module.exports = {
  first_name: {
    type: name,
    required: true,
    example: "Henry",
  },
  last_name: name,
  age: {
    type: new AlpacaInt( { validate: ( num ) => num > 0 } ),
    example: 32,
  },
  middle_name: {
    type: new AlpacaArray( name ),
    required: false,
    example: [ "Gary" ],
  },
  company: {
    type: new AlpacaArray( ref ),
    required: false,
    populate: true,
    ref: "Company",
  },
  parent: {
    type: new AlpacaReference(),
    required: false,
    populate: true,
    ref: "User",
  },
};
