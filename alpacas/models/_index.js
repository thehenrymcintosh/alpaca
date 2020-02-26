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
  },
  timestamps: true,
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

user.pushNestedRoute("get","test", async (req, res, next) => { 
  res.locals.test="oui";
  res.locals.data = await req.alpaca.model.count();
  next();
});

module.exports = {
  company,
  user,
}