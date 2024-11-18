const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    user_id: { type: String, ref: 'User', required: true },
    content: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
});

const Comment = mongoose.model('Post', commentSchema);
module.exports = Comment;