const express = require("express");
let router = express.Router();

// Handle all the invalid routes
// An invalid route is any route that has not been defined, such as for example '/fjdk/dfhsal/getitem'
router.all("*", (req, res, next) => {
    res.status(400).send({error: "invalid route"});
});

module.exports = router;