const User =  require("../models/user.js");
const express = require('express');
let router = express.Router();
router.get('/me', authToken,async(req,res) => {
    try{
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json(user);
    }catch (error){
        res.status(500).send({success:false,message: "Error in getMe"});
    }
});

module.exports = router;