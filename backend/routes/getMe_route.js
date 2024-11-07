const express = require('express');
import { authToken } from '../utils/AuthenticateToken';
import User from '../models/user';

const router = express.Router();

// fetch and return the currently authenticated user's information
router.get('/me', authToken,async (req, res) => {
    try{
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json(user);
    }catch(error){
        console.log("Error in getMe", error.message);
        res.status(500).send({error: 'Internal Server Error'});
    }
});
export default router;

// Goes into server.js : app.use('/api',getMe); getMe or whatever you want to call it
// it will go above everything