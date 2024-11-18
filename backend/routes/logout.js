const express = require("express");
let router = express.Router();

router.post('/', async (req, res) => {
    try {
        // even though we create and clear the cookie on the frontend we still need this here!
        res.clearCookie('tuneshare_cookie', {
            path: '/', 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'lax', 
        });
        res.status(200).send({ success: "Logged Out Successfully" });
    } catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

module.exports = router;
