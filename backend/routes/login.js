const express = require("express");
let router = express.Router();
const { userEmailExists } = require("../utils/user.js");
const User = require('../models/user.js');
const bcrypt = require('bcryptjs');
const { generateTokenAndSetCookie } = require("../utils/generateToken.js");

router.post("/login", async (req, res) => {
    try {
        if (!req.body.email || !req.body.password) {
            return res.status(400).send({success: false, message: "Missing required parameters" });
        }

        if (await userEmailExists(req.body.email)) {
            const user = await User.findOne({ email: req.body.email });

            if (!user) {
                return res.status(404).send({success: false, message: "User does not exist" });
            }

            const passwordMatches = await bcrypt.compare(req.body.password, user.password);
            if (req.body.email === user.email && passwordMatches) {
                
                generateTokenAndSetCookie(user._id,res);

                return res.status(200).send({success: true, message: "user has been authenticated" });
            } else {
                return res.status(401).send({success: false, message: "Invalid email or password" });
            }
        } else {
            return res.status(404).send({success: false, message: "User does not exist" });
        }
        
    } catch (err) {
        return res.status(500).send({success: false, message: "Server error" });
    }
});

module.exports = router;