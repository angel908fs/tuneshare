const express = require("express");
let router = express.Router();
const {userNameExists} = require("../utils/user.js");
const User = require('../models/user.js');
const createAccount = require("../utils/account_creation.js");

// create user
router.post("/user/create", async (req, res, next) => {
    try {
        // check if required request parameters are present
        if (!req.body.username || !req.body.email || !req.body.password) {
            return res.status(400).send({ error: "Missing required parameters" });
        }

         // Check for conflicting usernames and emails separately
         const userExists = await userNameExists(req.body.username);
         const emailExists = await emailExists(req.body.email);
 
         if (userExists)
         {
             return { success: false, message: "This username is already taken by another account. Please user another one." };
         }
 
         if (emailExists)
         {
             return { success: false, message: "This email is already ascociated with an account. Please use another one." };
         }
                 

        return await createAccount(req.body.username,  req.body.email, req.body.password);
    } catch (err) {
        return res.status(500).send({ error: "Server error" });
    }
});

module.exports = router;
