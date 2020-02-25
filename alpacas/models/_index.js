const user = require("./user");
const company = require("./company");
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

const companyOptions = {
  ...defaultOptions,
}
companyOptions.nestedRest = [
  {
    modelName: "User",
    path: "users",
    foreignField: "company",
  }
]

module.exports = {
  user: new AlpacaModel("User", user, defaultOptions ),
  company: new AlpacaModel("Company", company, companyOptions ),
}