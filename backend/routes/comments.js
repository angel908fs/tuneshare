const express = require("express");
let router = express.Router();
const User = require("../models/user.js");
const Comment = require("../models/comment.js");
const Post = require("../models.post.js");

router.post("/post-comment",  async (req, res, next) => { 
    if (!req.body.comment) {
        return res.status(400).send({ success: false, message: "missing required parameter: comment" });
    }
    if (!req.body.userID) {
        return res.status(400).send({ success: false, message: "missing required parameter: userID" });
    }
    if (!req.body.postID) {
        return res.status(400).send({ success: false, message: "missing required parameter: userID" });
    }

    const comment = req.body.comment;
    const userID = req.body.userID;
    const postID = req.body.postID;

    try {
        const user = await User.findOne({user_id: userID});
        if (!user) {
            return res.status(404).send({success: false, message: "user does not exist"});
        }
        const post = await Post.findOne({ post_id: postID });
        if (!post) {
            return res.status(404).send({success:false, message: "post does not exist"})
        }
        const newComment = new Comment({
            user_id: userID,
            comment: comment
        });
        await newComment.save()

        user.comments.push(newComment.comment_id);
        await user.save();

        post.comments.push(newComment.comment_id);
        await post.save();

        return res.status(200).send({ success: true, message: "comment posted successfully" });
    } catch (error) {
        return res.status(500).send({ success: false, message: "server error", error: error.message });
    }
});

module.exports = router;
