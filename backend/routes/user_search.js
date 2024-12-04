const express = require("express");
let router = express.Router();
const User = require("../models/user.js");

router.post("/user-search", async(req, res) => {
    try {
        if (!req.body.username) {
            return res.status(400).send({success: false, message: "missing username in request body"});
        }
        const username = req.body.username;
        const regex = new RegExp(`^${username}|.*${username}.*`, "i"); 
        // ^${username}: match starting with username
        // .*${username}.*: match username as a substring
        // "i": case insensitive

        const matches = await User.find({
            username: {$regex: regex}})
            .limit(10)
            .select("username user_id followers_count following_count");
    
        return res.status(200).send({success: true, message: "users retrieved succesfully",data: matches});
    } catch (error) {
        return res.status(500).send({success: false, message: "Internal server error", error: error.message});
    }

});

module.exports = router;