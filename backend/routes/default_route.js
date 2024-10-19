const express = require("express");
let router = express.Router();

// default route, return an 'OK' status code only
router.all("/", (req, res, next) => { 
    return res.statusCode(200);
});

module.exports = router;
