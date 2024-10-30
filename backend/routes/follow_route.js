const express = require("express");
let router = express.Router();
const { emailExists } = require("../utils/user.js");
const User = require("../models/user.js");

// User is the one who initiates the follow to target user
router.post("/follow", async (req, res) => {
    const {userID, target_userID} = req.body; // get the userID and target user ID from the request body, can be found using username or email

    try {    
        const user = await User.findOne({ user_id: userID }); // find the user with the given userID
        const target_user = await User.findOne({ user_id: target_userID }); // find the friend with the given friendID

        if (!user || !target_user) {                    // Check if the user or friend exists
            return res.status(404).json({ error: "User or friend not found" });
        }
        if(user.following.includes(target_userID)) {    // Check if the user is already following 
            return res.status(409).json({ error: "User is already friends with this user" });
        }
        if(target_user.following.includes(userID)) {    // Check if the target user already has user as follower
            return res.status(409).json({ error: "User is already friends with this user" });
        }
        user.following.push(target_userID);            // Add the target user to the user's following list
        target_user.followers.push(userID);            // Add the user to the target user's follower list
        await user.save();                              // Save the user
        await target_user.save();                       // Save the target user
        return res.status(200).json({ success: "User followed successfully" });
    
    } catch (error) {
        return res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
