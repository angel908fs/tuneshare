const express = require("express");
let router = express.Router();
const User = require("../models/user.js");
const Post = require("../models/post.js");

// we load posts in batches of 10 based on the 'page' parameter, 'page' must be >= 1

// page == 1 will return the 10 most recent posts
// page == 2 will skip the first 10 posts and return the 11th-20th most recent posts
// page == 3 will skip the first 20 posts and return the 21th-30th most recent posts
router.post("/load-feed", async(req, res) => {
    if (!req.body.userid) {
        return res.status(400).send({sucess: false, message: "missing user id in request body"});
    }
    if (!req.body.page) {
        return res.status(400).send({success: false, message: "missing page in request body"});
    }
    if (req.body.page < 1) {
        return res.status(400).send({success: false, message: "page parameter must be greater than or equal to 1"});
    }
    try {
        const userId = req.body.userid;
        const pageNumber = req.body.page; // page is used to load posts in batches of 10, page must start at 1

        const user = await User.findOne({user_id: userId});
        if (!user) {
            return res.status(404).send({success:false, message: "user not found"});
        }

        const postsPerPage = 10;
        const skip = (pageNumber - 1) * postsPerPage;
        // sort to get latests posts first
        // skip the first 10*page posts (if page is greater than 1)
        // limit the search to 10 post
        // populate the user_id field with the username from the User model, otherwise we would just get the user_id associated with the post
        const posts = await Post.find({user_id: {$in: user.following}}).sort({created_at: -1}).skip(skip).limit(postsPerPage).populate('user_id', 'username');
        
        if (posts.length == 0) {
            return res.status(404).send({success: true, message: "no posts available at the time"});
        }

        return res.status(200).send({success: true, data: posts});
    } catch (error) {
        return res.status(500).send({ success: false, message: "internal server error", error: error});
    }
});