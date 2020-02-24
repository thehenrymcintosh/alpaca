const { Name }= require("../types/_index");
const { Str, Int, Ref }= require("../../alpaca_core/types/_index");

const name = new Name();

module.exports = {
  first_name: {
    type: name,
    required: true,
    example: "Henry"
  },
  last_name: name,
  age: {
    type: new Int({ validators: ( num ) => num > 0 }),
    example: 32,
  },
  middle_name: {
    type: name,
    required: false,
    example: "Gary"
  },
  company_name: {
    type: name,
    required: true,
    example: "Roar"
  },
  parent: {
    type: new Ref(),
    required: false,
    populate: true,
    ref: "User"
  }
}