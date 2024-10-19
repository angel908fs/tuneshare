const User = require("../models/user.js");

// check if a user exists
const userExists = async(userID) => {
    const getUser = await User.findOne({user_id: userID});
    if (!getUser) 
        return false;
    return true;
};

module.exports = userExists;
