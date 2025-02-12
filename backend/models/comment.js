const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');   

const commentSchema = new mongoose.Schema({
    comment_id: { type: String, default: uuidv4 }, 
    user_id: { type: String, ref: 'User', required: true },
    content: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
});

const Comment = mongoose.model('Post', commentSchema);
module.exports = Comment;