const User = require("../models/user.js");
const Post = require("../models/post.js");
const Song = require("../models/songs.js");
const Comment = require("../models/comment.js");

const express = require("express");
let router = express.Router();

router.post("/admin/get-users",  async (req, res) => { 
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

router.post("/admin/get-posts",  async (req, res) => { 
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

router.post("/admin/get-songs",  async (req, res) => { 
    try {
        const Songs = await Song.find()
        .limit(1000);
        
        return res.status(200).send({
            success: true,
            message: "songs retrieved successfully",
            data: {
                songs: Songs
            }
        })
        } catch (error) {
        return res.status(500).send({ success: false, message: "server error", error: error.message });
    }
});

router.post("/admin/get-comments",  async (req, res) => { 
    try {
        const Comments = await Comment.find()
        .limit(1000);
        
        return res.status(200).send({
            success: true,
            message: "comments retrieved successfully",
            data: {
                comments: Comments
            }
        })
        } catch (error) {
        return res.status(500).send({ success: false, message: "server error", error: error.message });
    }
});

router.post("/admin/delete-comment", async (req, res) => {
    try {
        const { commentID } = req.body;
        if (!commentID) return res.status(400).send({ success: false, message: "Missing commentID" });

        await Comment.findOneAndDelete({ comment_id: commentID });
        return res.status(200).send({ success: true, message: "Comment deleted" });
    } catch (error) {
        return res.status(500).send({ success: false, message: "Failed to delete comment", error: error.message });
    }
});

router.post("/admin/delete-user", async (req, res) => {
    try {
        const { userID } = req.body;
        if (!userID) return res.status(400).send({ success: false, message: "Missing userID" });

        await User.findOneAndDelete({ user_id: userID });
        return res.status(200).send({ success: true, message: "User deleted" });
    } catch (error) {
        return res.status(500).send({ success: false, message: "Failed to delete user", error: error.message });
    }
});

router.post("/admin/delete-post", async (req, res) => {
    try {
        const { postID } = req.body;
        if (!postID) return res.status(400).send({ success: false, message: "Missing postID" });

        await Post.findOneAndDelete({ post_id: postID });
        return res.status(200).send({ success: true, message: "Post deleted" });
    } catch (error) {
        return res.status(500).send({ success: false, message: "Failed to delete post", error: error.message });
    }
});

router.post("/admin/delete-song", async (req, res) => {
    try {
        const { songID } = req.body;
        if (!songID) return res.status(400).send({ success: false, message: "Missing songID" });

        await Song.findOneAndDelete({ song_id: songID });
        return res.status(200).send({ success: true, message: "Song deleted" });
    } catch (error) {
        return res.status(500).send({ success: false, message: "Failed to delete song", error: error.message });
    }
});


module.exports = router;