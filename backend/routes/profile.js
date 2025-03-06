const express = require("express");
const bcrypt = require("bcryptjs");
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
    if (req.body.page < 1) {  // now you can safely check for page < 1
        return res.status(400).send({success: false, message: "page parameter must be greater than or equal to 1"});
    }
    try {
        const userID = req.body.user_id;
        const pageNumber = req.body.page; 

        const postsPerPage = 10;
        const skip = (pageNumber - 1) * postsPerPage;

        const userData = await User.findOne({ user_id: userID }).select("-password");
        if (!userData) {
            return res.status(404).send({success:false, message: "user not found"});
        }
        // sort to get latests posts first
        // skip the first 10*page posts (if page is greater than 1)
        // limit the search to 10 post
        const posts = await Post.find({user_id: userID}).sort({created_at: -1}).skip(skip).limit(postsPerPage);
        return res.status(200).send({success: true, message: "user data has been retrieved successfully", data: {user: userData, posts: posts}});
    } catch (error) {
        return res.status(500).send({ success: false, message: "internal server error", error: error.message});
    }
});

router.put("/profile/update", async(req, res)=>{
    try{
        const {
            user_id,
            fullName,
            username,
            email,
            bio,
            link,
            currentPassword,
            newPassword,
            profile_picture
        } = req.body;

        const user = await User.findOne({user_id});
        if(!user) {
            return res.status(404).send({
                success: false,
                message: "User not found."
            });
        }
        if( username && username !== user.username) {
            const existingUser = await User.findOne({username});
            if (existingUser) {
                return res.status(400).json ({
                    success:false,
                    message:"Username already taken."
                });
            }
            user.username = username;
        }
        if (email && email !== user.email) {
            const existingEmail = await User.findOne({ email });
            if (existingEmail) {
                return res.status(400).json({ success: false, message: "Email already in use." });
            }
            user.email = email;
        }

        // Verify current password before updating password
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ success: false, message: "Current password is required to change password." });
            }
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: "Incorrect current password." });
            }
            user.password = await bcrypt.hash(newPassword, 10);
        }

        // Update other profile fields
        if (fullName) user.fullName = fullName;
        if (bio) user.bio = bio;
        if (link) user.link = link;
        if (profile_picture) user.profile_picture = profile_picture;

        await user.save();
        
        return res.status(200).json({ success: true, message: "Profile updated successfully.", data: user });
    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
});

module.exports = router;