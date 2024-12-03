const express = require('express');
import { authToken } from '../utils/AuthenticateToken';
import User from '../models/user';

const router = express.Router();

// fetch and return the currently authenticated user's information
router.get('/me', authToken,async (req, res) => {
    try{
        await User.findById(req.user._id).select("-password");
        res.status(200).send({success: true, message: "User Authenticated!"});
    }catch(error){
        res.status(500).send({success:false, message: 'could not authenticate'});
    }
});
export default router;

// goes into server.js : app.use('/api',getMe); getMe or whatever you want to call it
// it will go above everything