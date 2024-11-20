const express = require("express");
let router = express.Router();
const User = require("../models/user.js");
const { generateToken } = require("../utils/generateToken.js");
const bcrypt = require("bcryptjs");

// create user
router.post("/signup", async (req, res) => {
    try {
        if (!req.body.email || !req.body.password || !req.body.username) {
            return res.status(400).send({success: false, message: "Missing required parameters" });
        }
        const email = req.body.email;
        const password = req.body.password;
        const username =req.body.username;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).send({success: false, message: "invalid email format" });
        }

        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(409).send({
                success: false,
                message: "This username is already taken by another account. Please use another one."
            });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(409).send({
                success: false,
                message: "This email is already associated with an account. Please use another one."
            });
        }

        if (password.length < 6) {
            return res.status(400).send({success: false, message: "Password must be at least 6 characters long" });
        }

        const hashedPassword = await bcrypt.hash(password, 0);

        const newUser = new User({
            email,
            username,
            password: hashedPassword,
        });

        await newUser.save();
        const token = generateToken(newUser.user_id);

        return res.status(201).send({
            success: true,
            message: "user has been created successfully",
            data: {
                username: newUser.username,
                email: newUser.email,
                user_id: newUser.user_id,
                jwt_token: token,
            }
        });
    } catch (error) {
        return res.status(500).send({success: false, message: "Server error", error: error.message});
    }
});

module.exports = router;
