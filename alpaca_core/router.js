const express = require( "express" );
const router = express.Router();
const models = require("../alpacas/models/_index");

router.get("/", ( req, res ) => {
  res.send( JSON.stringify(models) )
})

module.exports = router;
