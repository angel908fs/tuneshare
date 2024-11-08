const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');    // For generating UUIDs (User IDs)


// User Schema
const userSchema = new mongoose.Schema(
    {   
        // Personal User data
        username:{type: String,maxlength: 16, required: true, unique: true},
        email:{type: String,required: true, unique: true},
        user_id:{type: String, default: uuidv4},
        password:{type: String, required: true},

        // Profile specific data
        followers:[{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],                // The type is a mongo object (i.e. another user)
        following:[{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
        bio:{type: String, maxlength: 256},    
        
        followers_count: { type: Number, default: 0 },
        following_count: { type: Number, default: 0 },

        posts:[{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}],                    // A whole schema needs to be created for this seperately (export as 'Post'), but it's here for referance
        profile_picture:{type: String},                                               // This wont actually hold a picture, but maybe a URL due to DB size restraints 
    
        // API Keys
        user_api_key:{type: String},             // Holds user's temp API key (If they are signed into spotify) -> This is a future implementation

    }, 

    {timestamps: true}                // Generates 'createdAT' and 'updatedAt' timestamps
); 

// Create and export the User model
const User = mongoose.model('User', userSchema);
module.exports = User;
