const express = require("express");
let router = express.Router();
const { emailExists } = require("../utils/user.js");
const User = require("../models/user.js");

router.get("/userInfo/:userId", async (req, res) => {
    try {
      const user = await User.findOne({ user_id: req.params.userId }).select("username profile_picture verified");
  
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  });
  

  module.exports = router;