const { Name }= require("../types/_index");
const { AlpacaString, AlpacaInt, AlpacaReference, AlpacaArray, AlpacaDate }= require("../../alpaca_core/types/_index");
const name = new Name();

module.exports = {
  name: {
    type: name,
    required: true,
    example: "Roar Digital"
  },
  industry: {
    type: name,
    required: false,
    example: "Marketing"
  },
}