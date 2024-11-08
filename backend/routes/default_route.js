const express = require("express");
let router = express.Router();

// default route, return an 'OK' status code only
router.all("/", (req, res, next) => { 
    return res.status(200).send({success: true, message: "ok"});
});

module.exports = router;
