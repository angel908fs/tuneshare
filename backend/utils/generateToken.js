const jwt = require("jsonwebtoken");

const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({ userId },process.env.JWT_SECRET, {
        expiresIn: "30d", // Token will expire in 30 days
    });
    res.cookie("jwt",token, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // cookie will last 30 days
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV == "production",
    });
};
module.exports = { generateTokenAndSetCookie };