const express = require("express");
let router = express.Router();
const User = require("../models/user.js");
const Comment = require("../models/comment.js");
const Post = require("../models/post.js");

router.post("/post-comment",  async (req, res, next) => { 
    if (!req.body.comment) {
        return res.status(400).send({ success: false, message: "missing required parameter: comment" });
    }
    if (!req.body.userID) {
        return res.status(400).send({ success: false, message: "missing required parameter: userID" });
    }
    if (!req.body.postID) {
        return res.status(400).send({ success: false, message: "missing required parameter: postID" });
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


router.delete("/delete-comment", async (req, res, next) => {
    if (!req.body.commentID) {
        return res.status(400).send({ success: false, message: "missing required parameter: commentID" });
    }
    if (!req.body.userID) {
        return res.status(400).send({ success: false, message: "missing required parameter: userID" });
    }
    if (!req.body.postID) {
        return res.status(400).send({ success: false, message: "missing required parameter: postID" });
    }

    const commentID = req.body.commentID;
    const userID = req.body.userID;
    const postID = req.body.postID;
    
    try {
        const comment = await Comment.findOne({ comment_id: commentID });
        if (!comment) {
            return res.status(404).send({ success: false, message: "comment does not exist" });
        }
        
        const user = await User.findOne({ user_id: userID });
        if (!user) {
            return res.status(404).send({ success: false, message: "user does not exist" });
        }

        const post = await Post.findOne({ post_id: postID });
        if (!post) {
            return res.status(404).send({ success: false, message: "post does not exist" });
        }

        // pull will remove the commentID from the array
        user.comments.pull(commentID);
        await user.save();

        post.comments.pull(commentID);
        await post.save();

        // delete comment from the database
        await Comment.deleteOne({ comment_id: commentID });

        return res.status(200).send({ success: true, message: "comment deleted successfully" });
    } catch (error) {
        return res.status(500).send({ success: false, message: "server error", error: error.message });
    }
});

router.post("/get-comments", async (req, res) => {
    if (!req.body.postID) {
        return res.status(400).send({ success: false, message: "missing required parameter: postID" });
    }
    try {
        const postID = req.body.postID;
        const post = await Post.findOne({ post_id: postID });

        if (!post) {
            return res.status(404).json({ success: false, message: "post does not exist" });
        }
        const comments = await Comment.find({ comment_id: { $in: post.comments } }).sort({ created_at: -1 });
        const userIDs = [...new Set(comments.map(comment => comment.user_id))];

        const users = await User.find(
            { user_id: { $in: userIDs } },
            "user_id username profile_picture"
        );

        const userMap = {};
        users.forEach(user => {
            userMap[user.user_id] = {
                user_id: user.user_id,
                username: user.username,
                profile_picture: user.profile_picture
            };
        });

        const enrichedComments = comments.map(comment => ({
            comment_id: comment.comment_id,
            user_id: comment.user_id,
            comment: comment.comment,
            created_at: comment.created_at,
            username: userMap[comment.user_id]?.username || "Unknown User",
            profile_picture: userMap[comment.user_id]?.profile_picture || null
        }));

        return res.status(200).json({ success: true, data: { comments: enrichedComments } });

    } catch (error) {
        return res.status(500).json({ success: false, message: "server error", error: error.message });
    }
});



module.exports = router;
