const express = require('express');
const { authToken } = require('../utils/AuthenticateToken.js');
const User = require('../models/user.js');
const router = express.Router();

// fetch and return the currently authenticated user's information
router.get('/me', authToken, async (req, res) => {
    try{
        console.log("user ID from authToken: ", req.user?.user_id);
        const user = await User.findById(req.user_id).select('-password');
        if (!user){
            console.log("User not found");
            return res.status(404).send({success: false, message: "User not found"});
        }
        console.log("User found:",user);
        res.status(200).send({success: true, message: "User Authenticated!",user: req.user});
    }catch(error){
        
        res.status(500).send({success:false, message: 'could not authenticate'});
    }
});
module.exports = router;
// Goes into server.js : app.use('/api',getMe); getMe or whatever you want to call it
// it will go above everything