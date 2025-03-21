const express = require("express");
const router = express.Router();
const { createPost } = require("../utils/post.js");
const User = require("../models/user.js");
const Post = require("../models/post.js");

router.post("/create-post", async (req, res) =>
{
    const userID = req.body.user_id;
    const songLink = req.body.song_link;
    const content = req.body.content;

    try
    {
        if (!userID)
        {
            return res.status(400).send({success: false, message: "Please enter a user ID for the post." });
        }

        if (!songLink)
        {
            return res.status(400).send({success: false, message: "Please add a song link for the post." });
        }

        if (!content)
        {
            return res.status(400).send({success: false, message: "Please provide content for the post." });
        }

        const result = await createPost(userID, songLink, content);

        if (result.success)
        {
            return res.status(201).send({success: true, message: "Post has been created successfully", data: result.post});
        }

        return res.status(500).send({success: false, message: result.message });
    }
    catch (err)
    {
        return res.status(500).send({success: false, message: "Internal server error." });
    }
});

router.delete("/delete-post", async (req, res) => {
    const { userID, postID } = req.query; // Extract from query params

    if (!userID) {
        return res.status(400).send({ success: false, message: "Missing required parameter: userID" });
    }
    if (!postID) {
        return res.status(400).send({ success: false, message: "Missing required parameter: postID" });
    }

    try {
        const user = await User.findOne({ user_id: userID });
        if (!user) {
            return res.status(404).send({ success: false, message: "User does not exist" });
        }

        const post = await Post.findOne({ post_id: postID });
        if (!post) {
            return res.status(404).send({ success: false, message: "Post does not exist" });
        }
        if (post.user_id.toString() !== userID) {
            return res.status(403).send({ success: false, message: "Unauthorized: You can only delete your own posts." });
        }

        user.posts.pull(postID);
        await user.save();

        const deletedPost = await Post.findOneAndDelete({ post_id: postID });
        if (!deletedPost) {
            return res.status(404).send({ success: false, message: "Post not found or already deleted." });
        }

        return res.status(200).send({ success: true, message: "Post deleted successfully" });
    } catch (error) {
        return res.status(500).send({ success: false, message: "Server error", error: error.message });
    }
});

module.exports = router;
