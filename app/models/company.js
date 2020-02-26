const { Name } = require( "../types/_index" );
const { Types } = require( "../../src/index" );

const {
  AlpacaString, AlpacaInt, AlpacaReference, AlpacaArray, AlpacaDate,
} = Types;
const name = new Name();

module.exports = {
  name: {
    type: name,
    required: true,
    example: "Roar Digital",
  },
  industry: {
    type: name,
    required: false,
    example: "Marketing",
  },
};
