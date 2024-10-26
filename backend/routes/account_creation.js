const express = require("express");
let router = express.Router();
const { userNameExists, userEmailExists } = require("../utils/user.js");
const createAccount = require("../utils/account_creation.js");
const User = require("../models/user.js");
const { generateTokenAndSetCookie } = require("../utils/generateToken.js");
const bcrypt = require("bcryptjs");


// create user
router.post("/signup", async (req, res) => {
    try {
        const {email, username, password } = req.body;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({error: "invalid email format"});
        }

        const existingUser = await User.findOne({ username});
        if(existingUser){
            return res.status(400).json({error: "email is already taken"});
        }
        if (password.length < 6){
            return res.status(400).json({error: "Password must be at least 6 characters logn"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = new User({
            email,
            username,
            password: hashedPassword,
        });

        if(newUser){
            generateTokenAndSetCookie(newUser.user_id,res);
            await newUser.save();

            res.status(201).json({
                username: newUser.username,
                email: newUser.email,
                user_id: newUser.user_id,
            });
        }else{
            res.status(400).json({error: "Invalid User data:"});
        }

    } catch (error) {
        console.log("Error in account_creation",error.message);
        return res.status(500).send({ error: "Server error" }); // route goes here
    }
});

module.exports = router;
