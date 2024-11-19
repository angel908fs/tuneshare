const express = require("express");
let router = express.Router();
const User = require("../models/user.js");
const Post = require("../models/post.js");

// we load posts in batches of 10 based on the 'page' parameter, 'page' must be >= 1

// page == 1 will return the 10 most recent posts
// page == 2 will skip the first 10 posts and return the 11th-20th most recent posts
// page == 3 will skip the first 20 posts and return the 21th-30th most recent posts
router.post("/load-feed", async (req, res) => {
    try {
        const userId = req.body.userid;
        const pageNumber = req.body.page;

        if (!userId) {
            console.error("User ID is missing in the request body.");
            return res.status(400).send({ success: false, message: "Missing user ID in request body" });
        }

        if (!pageNumber) {
            console.error("Page parameter is missing.");
            return res.status(400).send({ success: false, message: "Missing page parameter in request body" });
        }

        const user = await User.findOne({ user_id: userId });
        
        if (!user) {
            console.error(`User not found with ID: ${userId}`);
            return res.status(404).send({ success: false, message: "User not found" });
        }

        const postsPerPage = 10;
        const skip = (pageNumber - 1) * postsPerPage;

        const posts = await Post.find({ user_id: { $in: [...user.following, userId] } })
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(postsPerPage);

        if (!posts) {
            console.error("No posts found.");
            return res.status(404).send({ success: false, message: "No posts found" });
        }

        const postsWithUserName = await Promise.all(
            posts.map(async (post) => {
                const postUser = await User.findOne({ user_id: post.user_id }, "username");
                return {
                    ...post.toObject(),
                    username: postUser ? postUser.username : "Unknown User",
                };
            })
        );

        res.status(200).send({ success: true, data: postsWithUserName });
    } catch (error) {
        console.error("Internal server error:", error);
        res.status(500).send({ success: false, message: "Internal server error", error: error.message });
    }
});

module.exports = router;