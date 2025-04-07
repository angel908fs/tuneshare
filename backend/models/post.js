const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');    // for generating UUIDs (User IDs)

const postSchema = new mongoose.Schema(
    {
        post_id: { type: String, default: uuidv4 }, 
        song_link: { type: String, required: true }, // Link to the song
        likes: { type: Number, default: 0 }, // count of likes
        comments: [{ type: String, ref: 'Comment' }], // list of comment IDs
        user_id: { type: String, default: uuidv4, ref: 'User', required: true }, // reference to the user who created the post
        verified:{type:Boolean, default:false },
        created_at: { type: Date, default: Date.now }
    }
);

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
