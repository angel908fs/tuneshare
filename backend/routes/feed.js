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
        const context = req.body.context;
        const userId = req.body.userid;
        const pageNumber = req.body.page;

        if (!userId || pageNumber < 1) {
            return res.status(400).send({ success: false, message: "Invalid request parameters." });
        }

        const user = await User.findOne({ user_id: userId });
        if (!user) {
            return res.status(404).send({ success: false, message: "User not found." });
        }

        const postsPerPage = 10;
        const skip = (pageNumber - 1) * postsPerPage;

        // find users by user ID (for profile page) or all users (for feed page)
        const userPosts = await User.find({ user_id: {
            $in: context === "profile" ? [userId] : [...user.following, userId]
        }});
        
        // create a mapping of user_id to posts array
        const userPostsMap = {};
        userPosts.forEach(u => {
            userPostsMap[u.user_id] = u.posts.map(post => JSON.parse(post));
        });

        // fetch posts from the Post collection
        const posts = await Post.find({ user_id: { $in: Object.keys(userPostsMap) } })
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(postsPerPage);

        // enrich posts with username
        const enrichedPosts = posts.map(post => {
            const userPostData = userPostsMap[post.user_id]?.find(userPost => userPost.post_id === post.post_id);
            return {
                ...post.toObject(),
                username: userPosts.find(u => u.user_id === post.user_id).username,
                content: userPostData ? userPostData.content : null,
            };
        });

        return res.status(200).send({
            success: true,
            message: "Posts retrieved successfully.",
            data: enrichedPosts,
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Internal server error.",
            error: error.message,
        });
    }
});


module.exports = router;