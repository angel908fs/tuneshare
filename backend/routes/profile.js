const express = require("express");
let router = express.Router();
const User = require("../models/user.js");
const Post = require("../models/post.js");

// loading the posts of a profile is almost the same as loading the posts for a user's feed
// we load posts in batches of 10 based on the 'page' parameter, 'page' must be >= 1

// page == 1 will return the 10 most recent posts
// page == 2 will skip the first 10 posts and return the 11th-20th most recent posts
// page == 3 will skip the first 20 posts and return the 21th-30th most recent posts

router.post("/profile", async(req, res) => {
    if (!req.body.user_id) {
        return res.status(400).send({success: false, message: "missing user_id in request body"});
    }
    if (req.body.page === undefined || req.body.page === null) {  // Check if page is undefined explicitly
        return res.status(400).send({success: false, message: "missing page in request body"});
    }
    if (req.body.page < 1) {  // Now you can safely check for page < 1
        return res.status(400).send({success: false, message: "page parameter must be greater than or equal to 1"});
    }
    try {
        const userID = req.body.user_id;
        const pageNumber = req.body.page; 

        const user = await User.findOne({user_id: userID});
        if (!user) {
            return res.status(404).send({success:false, message: "user not found"});
        }

        const postsPerPage = 10;
        const skip = (pageNumber - 1) * postsPerPage;

        const userData = await User.findOne({ user_id: userID }).select("username bio profile_picture followers_count following_count");
        // sort to get latests posts first
        // skip the first 10*page posts (if page is greater than 1)
        // limit the search to 10 post
        const posts = await Post.find({user_id: userID}).sort({created_at: -1}).skip(skip).limit(postsPerPage);
        if (!posts || posts.length === 0) {
            return res.status(404).send({success: true, message: "no posts available at the time"});
        }
        return res.status(200).send({success: true, message: "user data has been retrieved successfully", data: {user: userData, posts: posts}});
    } catch (error) {
        return res.status(500).send({ success: false, message: "internal server error", error: error.message});
    }
});

module.exports = router;