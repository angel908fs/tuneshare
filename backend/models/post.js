const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
    {
        post_id: { auto: true }, // Automatically generated ObjectId for the post
        song_link: { type: String, required: true }, // Link to the song
        likes: { type: Number, default: 0 }, // Count of likes
        comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }], // List of comment IDs
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the user who created the post
        created_at: { type: Date, default: Date.now }
    }
);

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
