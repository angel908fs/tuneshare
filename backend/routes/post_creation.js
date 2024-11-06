const express = require("express");
const router = express.Router();
const { createPost } = require("../utils/post.js");

router.post("/create-post", async (req, res) =>
{
    const userID = req.body.user_id;
    const songLink = req.body.song_link;
    const content = req.body.content;

    try
    {
        if (!userID)
        {
            return res.status(400).json({ error: "Please enter a user ID for the post." });
        }

        if (!songLink)
        {
            return res.status(400).json({ error: "Please add a song link for the post." });
        }

        if (!content)
        {
            return res.status(400).json({ error: "Please provide content for the post." });
        }

        const result = await createPost(userID, songLink, content);

        if (result.success)
        {
            return res.status(201).json(result.post);
        }

        return res.status(500).json({ error: result.message });
    }
    catch (err)
    {
        return res.status(500).json({ error: "Internal server error." });
    }
});

module.exports = router;
