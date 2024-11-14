const jwt = require("jsonwebtoken");

const generateTokenAndSetCookie = (user_id, res) => {
    // takes both user and email
    const token = jwt.sign({
        user_id : user_id}, 
        process.env.JWT_SECRET, 
        {
            expiresIn: "30d", // Token will expire in 30 days
        }
    );
    res.cookie("tuneshare_cookie", token, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // cookie will last 30 days
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV == "production",
    });
};

const generateToken = (user_id) => {
    const token = jwt.sign({
        user_id : user_id}, 
        process.env.JWT_SECRET, 
        {
            expiresIn: "30d", // Token will expire in 30 days
        }
    );
    return token
};

module.exports = { generateTokenAndSetCookie, generateToken };