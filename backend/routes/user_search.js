const express = require("express");
let router = express.Router();
const User = require("../models/user.js");

router.post("/user-search", async(req, res) => {
    try {
        if (!req.body.username) {
            return res.status(400).send({success: false, message: "missing username in request body"});
        }

        if (!req.body.viewer_id) {
            return res.status(400).send({success: false, message: "missing viewer_id in request body"});
        }
        const {username, viewer_id}  = req.body;
        
        const regex = new RegExp(`^${username}|.*${username}.*`, "i"); 
        // ^${username}: match starting with username
        // .*${username}.*: match username as a substring
        // "i": case insensitive

        const matches = await User.find({
            username: {$regex: regex},
            user_id :{$ne: viewer_id}
        })
            .limit(10)
            .select("username user_id followers_count following_count");
        // Get viewer's following list
        const viewer = await User.findOne({user_id: viewer_id}).select("following");
        const viewerFollowing = viewer?.following || [];

        //Add isFollowing flag to each result
        const enrichedMatches = matches.map((user) =>({
            ...user.toObject(),
            isFollowing: viewerFollowing.includes(user.user_id)
        }));
    
        return res.status(200).send({success: true, message: "users retrieved succesfully",data: enrichedMatches});
    } catch (error) {
        return res.status(500).send({success: false, message: "Internal server error", error: error.message});
    }

});

module.exports = router;