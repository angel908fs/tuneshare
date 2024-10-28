const User = require("../models/user.js");

// check if a user exists using user_id
const userIdExists = async(userID) => {
    const getUser = await User.findOne({user_id: userID});
    if (!getUser) 
        return false;
    return true;
};

// check if a user exists using email
const userEmailExists = async(email) => {
    const getUser = await User.findOne({email: email});
    if (!getUser) 
        return false;
    return true;
};

// check if a user exists using username
const userNameExists = async(username) => {
    const getUser = await User.findOne({username: username});
    if (!getUser) 
        return false;
    return true;
};

module.exports = {userIdExists, userEmailExists, userNameExists};
