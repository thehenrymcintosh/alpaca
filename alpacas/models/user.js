const { Name }= require("../types/_index");
const { Str, Int, Ref, Arr }= require("../../alpaca_core/types/_index");
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
    type: new Arr(name),
    required: false,
    example: ["Gary"]
  },
  company: {
    type: new Ref(),
    required: false,
    populate: true,
    ref: "Company"
  },
  parent: {
    type: new Ref(),
    required: false,
    populate: true,
    ref: "User",
  }
}