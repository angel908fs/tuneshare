const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');   


// User Schema
const userSchema = new mongoose.Schema(
    {   
        // personal user data
        fullName: {type: String, maxlength:25, default: ""}, // added name
        username:{type: String,maxlength: 16, required: true, unique: true},
        email:{type: String,required: true, unique: true},
        user_id:{type: String, default: uuidv4},
        password:{type: String, required: true},

        // profile specific data
        followers:[{type: String, ref: 'User'}],  
        following:[{type: String, ref: 'User'}],
        
        bio:{type: String, maxlength: 256, default: ""},
        link: {type: String, maxlength: 512, default: ""},    // added link 
        
        comments: [{type: String, ref: 'Comment'}],
        
        followers_count: { type: Number, default: 0 },
        following_count: { type: Number, default: 0 },

        posts:[{type: String, ref: 'Post'}], 
        profile_picture:{type: String}, 
        verified:{type:Boolean, default:false},
    
        // API keys
        user_api_key:{type: String},             // Holds user's temp API key (If they are signed into spotify) -> This is a future implementation
        liked_posts:[{type:String, ref: 'Post'}] // holds a list of the IDs of the posts the user has liked
    }, 

    {timestamps: true}                // generates 'createdAT' and 'updatedAt' timestamps
); 

const User = mongoose.model('User', userSchema);
module.exports = User;
