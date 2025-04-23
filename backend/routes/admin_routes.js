const User = require("../models/user.js");
const Post = require("../models/post.js");


router.post("/get-users",  async (req, res) => { 
    try {
        const Users = await User.find()
        .limit(1000);
        
        return res.status(200).send({
            success: true,
            message: "users retrieved successfully",
            data: {
                users: Users
            }
        })
        } catch (error) {
        return res.status(500).send({ success: false, message: "server error", error: error.message });
    }
});

router.post("/get-posts",  async (req, res) => { 
    try {
        const Users = await User.find()
        .limit(1000);
        
        return res.status(200).send({
            success: true,
            message: "users retrieved successfully",
            data: {
                users: Users
            }
        })
        } catch (error) {
        return res.status(500).send({ success: false, message: "server error", error: error.message });
    }
});