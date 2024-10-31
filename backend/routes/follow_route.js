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
           if(!user){ return res.status(404).json({ error: "User not found" });}
           if(!target_user){ return res.status(404).json({ error: "Target user not found" });}
        }
        if(user.following.includes(target_userID) || target_user.followers.includes(userID)) {    // Check if the user is already following, or the target user already has the user as a follower 
            return res.status(409).json({ error: "User is already following target user" });
        }
       
        user.following.push(target_userID);            // Add the target user to the user's following list
        target_user.followers.push(userID);            // Add the user to the target user's follower list
        await user.save();                              // Save the user
        await target_user.save();                       // Save the target user
        return res.status(200).json({ success: "User followed successfully" });
    
    } catch (error) {
        console.error("Server error:", error);  // Log error to console
        return res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
