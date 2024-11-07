const express = require("express");
const { generateTokenAndSetCookie } = require("../utils/generateToken.js");
let router = express.Router();
const User = require('../models/user.js');

router.post('/', async (req,res) => {
    try {
        res.clearCookie('jwt',{
            httpOnly: true,
            secure: process.env.NODE_ENV == 'production',
            sameSite: 'lax',
        })
    }catch (error) {
        res.status(500).send({error: 'Internal Service'});
    }
});