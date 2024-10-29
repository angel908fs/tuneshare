// Comment Schema (for reference, you might have a separate schema for comments)
const commentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Create and export the Comment model
const Comment = mongoose.model('Comment', commentSchema);