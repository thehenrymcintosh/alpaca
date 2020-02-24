const user = require("./user");
const AlpacaModel = require("../../alpaca_core/model");
const path = require("path");

const defaultOptions = {
  generateOpenApi: { 
    dir: path.join(__dirname, "..","..","docs","models"), 
  },
  generateTs: {
    dir: path.join(__dirname, "..","..","docs","ts"),
    additionalProperties: false,
  }
}

const userOptions = {
  ...defaultOptions,
}
userOptions.generateTs = {
  ...userOptions.generateTs,
  required: ["first_name"],
}

module.exports = {
  user: new AlpacaModel("User", user, userOptions ),
}