const express = require("express");
const router = express.Router();
const User = require("../models/user");

router.post("/suggested-users", async (req, res) => {
    try {
        const userID = req.body.user_id;
        console.log(`API Called with userID: ${userID}`);

        if (!userID || userID.trim() === "") {
            console.warn("Invalid or missing userID in request");
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }

        // Find the user in the database
        const currentUser = await User.findOne({ user_id: userID }).select("following");
        
        if (!currentUser) {
            console.warn(`User not found in database: ${userID}`);
            return res.status(404).json({ success: false, message: "User not found" });
        }

        console.log(`User found: ${currentUser.username}, Following: ${currentUser.following.length}`);

        // Debugging: Check if `following` field exists
        if (!Array.isArray(currentUser.following)) {
            console.error(`Unexpected 'following' field format:`, currentUser.following);
            return res.status(500).json({ success: false, message: "Invalid following data format" });
        }

        // Find mutuals (friends of friends)
        let mutualsSet = new Set();
        const followedUsersData = await User.find({ user_id: { $in: currentUser.following } }).select("following");

        followedUsersData.forEach(followedUser => {
            followedUser.following.forEach(friendID => {
                if (friendID !== userID && !currentUser.following.includes(friendID)) {
                    mutualsSet.add(friendID);
                }
            });
        });

        // Convert mutualsSet to an array and fetch user details
        const suggestedUsers = await User.find({ user_id: { $in: Array.from(mutualsSet) } })
            .sort({ followers_count: -1 })
            .limit(5)
            .select("user_id username profile_picture followers_count");

        console.log("Suggested Users Response:", suggestedUsers);

        // Add isFollowing flag based on currentUser.following
        const enrichedSuggestedUsers = suggestedUsers.map((user) => ({
            ...user.toObject(),
            isFollowing: currentUser.following.includes(user.user_id),
        }));

        return res.json({ success: true, users: enrichedSuggestedUsers });

    } catch (error) {
        console.error("🔥 Error fetching suggested users:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});

module.exports = router;
