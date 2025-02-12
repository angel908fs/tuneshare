const express = require("express");
let router = express.Router();

router.post("/post-comment", (req, res, next) => { 
    if (!req.body.commentID) {
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

module.exports = router;
