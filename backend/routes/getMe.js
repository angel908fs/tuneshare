const User =  require("../models/user.js");
const express = require('express');
let router = express.Router();
router.get('/me', async(req,res) => {
    try{
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json(user);
    }catch (error){
        console.log("Error in getMe", error.message);
        res.status(500).json({error: "Internal Sever Error"});
    }
});

module.exports = router;