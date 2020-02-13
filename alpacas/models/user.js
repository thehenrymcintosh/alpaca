const { Name }= require("../types/_index");
const { Str, Int }= require("../../alpaca_core/types/_index");

module.exports = {
  first_name: new Name(),
  last_name: {
    type: new Str(),
    required: false,
  },
  age: new Int({ validators: ( num ) => num > 0 })
}