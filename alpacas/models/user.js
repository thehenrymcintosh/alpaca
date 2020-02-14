const { Name }= require("../types/_index");
const { Str, Int }= require("../../alpaca_core/types/_index");

module.exports = {
  first_name: {
    type: new Name(),
    required: true,
  },
  last_name: new Name(),
  age: new Int({ validators: ( num ) => num > 0 }),
  middle_name: {
    type: new Name(),
    required: false,
  }
}