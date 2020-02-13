const user = require("./user");
const AlpacaModel = require("../../alpaca_core/model");

module.exports = {
  user: new AlpacaModel("User", user ),
}