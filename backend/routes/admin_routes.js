const User = require("../models/user.js");
const Post = require("../models/post.js");
const express = require("express");
let router = express.Router();

router.post("/get-users",  async (req, res) => { 
    try {
        const Users = await User.find()
        .select("-profile_picture")
        .limit(1000);
        
        return res.status(200).send({
            success: true,
            message: "users retrieved successfully",
            data: {
                users: Users
            }
        })
        } catch (error) {
        return res.status(500).send({ success: false, message: "server error", error: error.message });
    }
});

router.post("/get-posts",  async (req, res) => { 
    try {
        const Posts = await Post.find()
        .limit(1000);
        
        return res.status(200).send({
            success: true,
            message: "posts retrieved successfully",
            data: {
                posts: Posts
            }
        })
        } catch (error) {
        return res.status(500).send({ success: false, message: "server error", error: error.message });
    }
});

module.exports = router;