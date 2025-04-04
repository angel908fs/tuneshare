const express = require("express");
let router = express.Router();
const Middleware = require("../models/middleware.js");

router.post("/get-logs", async(req, res)=>{
    const MiddlewareLogs = Middleware.find()
    .sort({created_at:-1})
    .limit(100);

    return res.status(200).send({
        success: true,
        message: "logs retrieved successfully",
        data: {
            logs: MiddlewareLogs
        }
    })
})

module.exports = router;