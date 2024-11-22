const express = require("express");
let router = express.Router();

// handle all the invalid routes
// an invalid route is any route that has not been defined, such as for example '/fjdk/dfhsal/getitem'
router.all("*", (req, res, next) => {
    res.status(400).send({success: false, message: "invalid route"});
});

module.exports = router;