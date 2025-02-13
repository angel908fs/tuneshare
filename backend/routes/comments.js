const express = require("express");
let router = express.Router();
const User = require("../models/user.js");
const Comment = require("../models/comment.js");

router.post("/post-comment",  async (req, res, next) => { 
    if (!req.body.content) {
        return res.status(400).send({ success: false, message: "missing required parameter: comment" });
    }
    if (!req.body.userID) {
        return res.status(400).send({ success: false, message: "issing required parameter: userID" });
    }

    const content= req.body.content;
    const userID = req.body.userID;

    try {
        const user = await User.findOne({ user_id: userID });
        if (!user) {
            return res.status(404).send({ success: false, message: "user does not exist" });
        }

        if (user.liked_posts && user.liked_posts.includes(postID)) {
            return res.status(200).send({ success: true, message: "Post already liked by user" });
        }

        user.liked_posts.push(postID);
        await user.save();

        post.likes += 1;
        await post.save();

        return res.status(200).send({ success: true, message: "comment posted successfully" });
    } catch (error) {
        return res.status(500).send({ success: false, message: "server error", error: error.message });
    }
});

module.exports = router;
