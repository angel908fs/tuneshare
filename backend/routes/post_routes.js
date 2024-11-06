const express = require("express");
let router = express.Router();
const Post = require("../models/post"); 

// Create a new post
router.post("/", async (req, res) => {
    try {
        const { title, content, author } = req.body;

        // Validate required fields
        if (!title || !content || !author) {
            return res.status(400).json({ error: "Missing required fields: title, content, author" });
        }

        // Create the post
        const newPost = new Post({
            title,
            content,
            author,
            createdAt: new Date()
        });

        await newPost.save();
        return res.status(201).json({ message: "Post created successfully", post: newPost });
    } catch (error) {
        console.error("Error creating post:", error);
        return res.status(500).json({ error: "Server error" });
    }
});

// Get all posts
router.get("/", async (req, res) => {
    try {
        const posts = await Post.find();
        return res.status(200).json(posts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        return res.status(500).json({ error: "Server error" });
    }
});

// Get a specific post by ID
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        return res.status(200).json(post);
    } catch (error) {
        console.error("Error fetching post:", error);
        return res.status(500).json({ error: "Server error" });
    }
});

// Update a post by ID
router.put("/:id", async (req, res) => {
    try {
        const { title, content } = req.body;

        // Validate required fields
        if (!title || !content) {
            return res.status(400).json({ error: "Missing required fields: title, content" });
        }

        // Update the post
        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id,
            { title, content, updatedAt: new Date() },
            { new: true }
        );

        if (!updatedPost) {
            return res.status(404).json({ error: "Post not found" });
        }
        return res.status(200).json({ message: "Post updated successfully", post: updatedPost });
    } catch (error) {
        console.error("Error updating post:", error);
        return res.status(500).json({ error: "Server error" });
    }
});

// Delete a post by ID
router.delete("/:id", async (req, res) => {
    try {
        const deletedPost = await Post.findByIdAndDelete(req.params.id);
        if (!deletedPost) {
            return res.status(404).json({ error: "Post not found" });
        }
        return res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("Error deleting post:", error);
        return res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
