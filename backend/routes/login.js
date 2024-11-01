const express = require("express");
let router = express.Router();
const { userEmailExists } = require("../utils/user.js");
const User = require('../models/user.js');
const bcrypt = require('bcryptjs');

router.post("/login", async (req, res) => {
    try {
        if (!req.body.email || !req.body.password) {
            return res.status(400).send({ error: "Missing required parameters" });
        }

        if (await userEmailExists(req.body.email)) {
            const user = await User.findOne({ email: req.body.email });

            if (!user) {
                return res.status(404).send({ error: "User does not exist" });
            }

            const passwordMatches = await bcrypt.compare(req.body.password, user.password);
            if (req.body.email === user.email && passwordMatches) {
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