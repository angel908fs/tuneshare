const express = require("express");
let router = express.Router();
const userExists = require("../utils/user.js");
const User = require('../models/user.js');

// authenticate user
router.post("/user/authenticate", async(req, res, next) => {
    if (userExists(req.params.userID)) {
        const user = await User.findOne({username: req.params.userID});
        if (req.query.email == user.email && req.query.password == user.password) {
            return res.status(200).send({success: "user has been authenticated"});
        } else {
            return res.status(401).send({error: "invalid email or password"});
        }
    }  else {
        return res.status(404).send({error: "user does not exist"});
    }
})

module.exports = router;
