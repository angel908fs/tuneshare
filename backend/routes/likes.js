const express = require("express");
let router = express.Router();
const Post = require("../models/post.js");
const User = require("../models/user.js");


router.post("/like", async (req, res) => {
    if (!req.body.postID) {
        return res.status(400).send({ success: false, message: "Missing required parameter: postID" });
    }
    if (!req.body.userID) {
        return res.status(400).send({ success: false, message: "Missing required parameter: userID" });
    }

    const postID = req.body.postID;
    const userID = req.body.userID;

    try {
        const post = await Post.findOne({ post_id: postID });
        if (!post) {
            return res.status(404).send({ success: false, message: "Post does not exist" });
        }

        const user = await User.findOne({ user_id: userID });
        if (!user) {
            return res.status(404).send({ success: false, message: "User does not exist" });
        }

        if (user.liked_posts && user.liked_posts.includes(postID)) {
            return res.status(200).send({ success: true, message: "Post already liked by user" });
        }

        user.liked_posts.push(postID);
        await user.save();

        post.likes += 1;
        await post.save();

        return res.status(200).send({ success: true, message: "Post liked successfully" });
    } catch (error) {
        return res.status(500).send({ success: false, message: "Server error", error: error.message });
    }
});


// post method to unlike a post
// takes in a postID value and decreases the number of likes of a post by one
router.post("/unlike", async (req, res) => {
    if (!req.body.postID) {
        return res.status(400).send({ success: false, message: "Missing required parameter: postID" });
    }
    if (!req.body.userID) {
        return res.status(400).send({ success: false, message: "Missing required parameter: userID" });
    }

    const postID = req.body.postID;
    const userID = req.body.userID;

    try {
        const post = await Post.findOne({ post_id: postID });
        if (!post) {
            return res.status(404).send({ success: false, message: "Post does not exist" });
        }

        const user = await User.findOne({ user_id: userID });
        if (!user) {
            return res.status(404).send({ success: false, message: "User does not exist" });
        }

        if (!user.liked_posts || !user.liked_posts.includes(postID)) {
            return res.status(400).send({ success: false, message: "Cannot unlike a post that has not been liked" });
        }

        user.liked_posts = user.liked_posts.filter(id => id !== postID);
        await user.save();

        if (post.likes > 0) {
            post.likes -= 1;
            await post.save();
        }

        return res.status(200).send({ success: true, message: "Post unliked successfully" });
    } catch (error) {
        return res.status(500).send({ success: false, message: "Server error", error: error.message });
    }
});



// get method to get like counts 
// takes in a postID value and returns a number representing the like count of a post
router.post("/like-count", async (req, res) => {
    if (!req.body.postID) {
        return res.status(400).send({ success: false, message: "Missing required parameter: postID" });
    }

    const postID = req.body.postID;

    try {
        const post = await Post.findOne({post_id: postID});

        if (!post) {
           if(!post){ return res.status(404).send({success: false, message: "Post does not exist"});}
        }

        const likeCount = post.likes;

        return res.status(200).send({success:true, message: "like count retrieved successfully", data: {likes: likeCount}})
    } catch (error) {
        return res.status(500).send({success: false, message: "Server error", error: error.message});
    }

});

router.post("/user-liked-posts", async (req, res) => {
    if (!req.body.userID) {
        return res.status(400).send({ success: false, message: "Missing required parameter: userID" });
    }

    const userID = req.body.userID;

    try {
        const user = await User.findOne({ user_id: userID });
        if (!user) {
            return res.status(404).send({ success: false, message: "User does not exist" });
        }

        return res.status(200).send({ success: true, message: "user likes retrieved successfully", data: {liked_posts: user.liked_posts} });
    } catch (error) {
        return res.status(500).send({ success: false, message: "Server error", error: error.message });
    }
});

module.exports = router;
