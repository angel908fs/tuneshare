const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');    // For generating UUIDs (User IDs)

const postSchema = new mongoose.Schema(
    {
        post_id: { type: String, default: uuidv4 }, // For generating Post IDs
        song_link: { type: String, required: true }, // Link to the song
        likes: { type: Number, default: 0 }, // Count of likes
        comments: [{ type: String, ref: 'Comment' }], // List of comment IDs
        user_id: { type: String, default: uuidv4, ref: 'User', required: true }, // Reference to the user who created the post
        created_at: { type: Date, default: Date.now }
    }
);

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
