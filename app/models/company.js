const { Name } = require( "../types/_index" );
const { AlpacaTypes } = require( "../../lib/index" );

const {
  AlpacaString, AlpacaInt, AlpacaReference, AlpacaArray, AlpacaDate,
} = AlpacaTypes;
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
