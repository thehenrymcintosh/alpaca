const userSrc = require("./user");
const companySrc = require("./company");
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
const company = new AlpacaModel("Company", companySrc, companyOptions );
const user = new AlpacaModel("User", userSrc, defaultOptions );

module.exports = {
  company,
  user,
}