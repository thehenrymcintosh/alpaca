const { Name }= require("../types/_index");
const { Str, Int, Ref, Arr }= require("../../alpaca_core/types/_index");
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