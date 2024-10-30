const express = require("express");
const router = express.Router();
const { createPost } = require("../utils/post.js");

router.post("/create-post", async (req, res) =>
{
    const { user_id, song_link, content } = req.body;

    try
    {
        if (!user_id)
        {
            return res.status(400).json({ error: "Please enter a user ID for the post." });
        }

        if (!song_link)
        {
            return res.status(400).json({ error: "Please add a song link for the post." });
        }

        if (!content)
        {
            return res.status(400).json({ error: "Please provide content for the post." });
        }

        const result = await createPost(user_id, song_link, content);

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
