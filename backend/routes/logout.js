const express = require("express");
let router = express.Router();

router.post('/', async (req, res) => {
    try {
        res.status(200).send({ success: "Logged Out Successfully" });
    } catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

module.exports = router;
