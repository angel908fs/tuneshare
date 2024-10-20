const express = require("express");
let router = express.Router();
const userExists = require("../utils/user.js");
const User = require('../models/user.js');

// authenticate user
router.post("/user/authenticate", async (req, res, next) => {
    try {
        // check if required request parameters are present
        if (!req.body.userID || !req.body.email || !req.body.password) {
            return res.status(400).send({ error: "Missing required parameters" });
        }

        // check if user exists
        if (userExists(req.body.userID)) {
            const user = await User.findOne({ username: req.body.userID });
            
            // check if email and password match
            if (req.body.email === user.email && req.body.password === user.password) {
                return res.status(200).send({ success: "user has been authenticated" });
            } else {
                return res.status(401).send({ error: "Invalid email or password" });
            }
        } else {
            return res.status(404).send({ error: "User does not exist" });
        }
    } catch (err) {
        return res.status(500).send({ error: "Server error" });
    }
});

module.exports = router;
