const express = require("express");
let router = express.Router();
const Middleware = require("../models/middleware.js");

router.post("/get-logs", async(req, res)=>{

    const MiddlewareLogs = await Middleware.find()

    .sort({timestamp:-1})
    .limit(1000);

    return res.status(200).send({
        success: true,
        message: "logs retrieved successfully",
        data: {
            logs: MiddlewareLogs
        }
    })
})

module.exports = router;