const express = require("express");
let router = express.Router();
const { emailExists } = require("../utils/user.js");
const User = require("../models/user.js");

// user is the one who initiates the follow to target user
router.post("/follow", async (req, res) => {

    // check if the required parameters are present (non NULL or empty)
        if (!req.body.target_userID) {
            return res.status(400).send({ success: false, message: "Missing required parameter: target_userID" });
        }
        if (!req.body.userID) {
            return res.status(400).send({ success: false, message: "Missing required parameter: userID" });
        }
    const userID = req.body.userID;
    const target_userID = req.body.target_userID;

    try {    
        const user = await User.findOne({ user_id: userID }); // find the user with the given userID
        const target_user = await User.findOne({ user_id: target_userID }); // find the friend with the given friendID

        if (!user || !target_user) {                    // check if the user or friend exists
           if(!user){ return res.status(404).json({success: false, message: "User not found" });}
           if(!target_user){ return res.status(404).json({success: false, message: "Target user not found" });}
        }
        if(user.following.includes(target_userID) || target_user.followers.includes(userID)) {    // check if the user is already following, or the target user already has the user as a follower 
            return res.status(409).json({success: false, message: "User is already following target user" });
        }
        
        user.following.push(target_userID);            // add the target user to the user's following list
        target_user.followers.push(userID);            // add the user to the target user's follower list
        user.following_count++;
        target_user.followers_count++;
        await user.save();                              // save the user
        await target_user.save();                       // save the target user
        return res.status(200).json({success: true, message: "User followed successfully" });
    
    } catch (error) {
        // console.error("Serversuccess: false, message:", error);  // Log error to console
        return res.status(500).json({success: false, message: "Server error", error: error.message});
    }

});

module.exports = router;
