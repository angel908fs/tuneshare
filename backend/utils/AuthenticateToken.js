const jwt = require('jsonwebtoken');
const User = require('../models/user.js');
//this is a protectroute

//middleware that performs user authentication
const authToken = async (req, res, next) => {
    try{
        const token = req.cookies.jwt;// accesses JWT token 
        if(!token){ // if no token is found 401
            return res.status(401).send({success: false, message: 'Unauthorized: No Token Provided'});
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);// decodes and verifes the token
        const { user_id, email } = decoded;
        const user = await User.findById({user_id: user_id, email}).select('-password');
       
        if(!user){ // User check
            return res.status(404).send({success: false, message: 'User not found'});
        }
        req.user = user; // attches the user data to the req object
        next();
    }catch(error){
        console.error("Error in authToken middleware:", error.message);
        return res.status(500).send({success:false, message: 'Internal Server Error, In AuthenticateToken'});
    }
};

module.exports = { authToken };