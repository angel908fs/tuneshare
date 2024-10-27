const mongoose = require('mongoose');



// Post Schema
const postSchema = new mongoose.Schema(
    {
        post_id: { auto: true }, // Automatically generated ObjectId for the post
        song_link: { type: String, required: true }, // Link to the song
        likes: { type: Number, default: 0 }, // Count of likes
        comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }], // List of comment IDs
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Reference to the user who created the post
    },
    { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Create and export the Post model
const Post = mongoose.model('Post', postSchema);
module.exports = { Post, Comment };
