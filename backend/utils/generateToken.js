const jwt = require("jsonwebtoken");

const generateTokenAndSetCookie = (user_id,email, res) => {
    // takes both user and email
    const token = jwt.sign({ user_id, email },process.env.JWT_SECRET, {
        expiresIn: "30d", // Token will expire in 30 days
    });
    res.cookie("jwt",token, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // cookie will last 30 days
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV !== "development",
    });
};
module.exports = { generateTokenAndSetCookie };