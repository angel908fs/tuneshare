const express = require("express");
let router = express.Router();
const Post = require("../models/post.js");

router.post("/like", async (req, res) => {
    if (!req.body.postID) {
        return res.status(400).send({ success: false, message: "Missing required parameter: postID" });
    }

    const postID = req.body.postID;

    try {
        const post = await Post.findOne({post_id: postID});
        if (!post) {
           if(!post){ return res.status(404).send({success: false, message: "Post does not exist" });}
        }

        post.likes += 1;
        await post.save();
        return res.status(200).send({success: true, message: "post liked successfully"})
    } catch (error) {
        return res.status(500).send({success: false, message: "Server error", error: error.message});
    }

});

// post method to unlike a post
// takes in a postID value and decreases the number of likes of a post by one
router.post("/unlike", async (req, res) => {
    if (!req.body.postID) {
        return res.status(400).send({ success: false, message: "Missing required parameter: postID" });
    }

    const postID = req.body.postID;

    try {
        const post = await Post.findOne({post_id: postID});
        if (!post) {
           if(!post){ return res.status(404).send({success: false, message: "Post does not exist" });}
        }
        if (post.likes > 0) { // add this check to avoid having negative like counts
            post.likes -= 1;
        } 
        await post.save();
        return res.status(200).send({success: true, message: "post unliked successfully"})
    } catch (error) {
        return res.status(500).send({success: false, message: "Server error", error: error.message});
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

module.exports = router;
