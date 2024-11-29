const express = require("express");
const axios = require("axios"); // Add axios for HTTP requests
const router = express.Router();
const { createPost } = require("../utils/post.js");


router.post("/create-post", async (req, res) => {
    const userID = req.body.user_id;
    const songLink = req.body.song_link; // Expect the Spotify link directly from the frontend
    const content = req.body.content;


    try {
        if (!userID) {
            return res.status(400).send({ success: false, message: "Please enter a user ID for the post." });
        }


        if (!songLink) {
            return res.status(400).send({ success: false, message: "Please provide a song link for the post." });
        }


        if (!content) {
            return res.status(400).send({ success: false, message: "Please provide content for the post." });
        }


        // Create the post
        const result = await createPost(userID, songLink, content);


        if (result.success) {
            return res.status(201).send({
                success: true,
                message: "Post has been created successfully",
                data: { post: result.post },
            });
        }


        return res.status(500).send({ success: false, message: result.message });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ success: false, message: "Internal server error." });
    }
});


module.exports = router;


