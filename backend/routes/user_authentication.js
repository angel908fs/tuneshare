const express = require("express");
let router = express.Router();
const { userEmailExists } = require("../utils/user.js");
const User = require('../models/user.js');

// authenticate user
router.post("/login", async (req, res) => {
    try {
        // Check if required request parameters are present
        if (!req.body.email || !req.body.password) {
            return res.status(400).send({ error: "Missing required parameters" });
        }

        // Check if user exists (await the promise)
        if (await userEmailExists(req.body.email)) {
            const user = await User.findOne({ email: req.body.email });

            // Check if user was found (handle case where findOne returns null)
            if (!user) {
                return res.status(404).send({ error: "User does not exist" });
            }

            // Check if email and password match
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