const jwt = require('jsonwebtoken');
import User from '../models/user.js';
//this is a protectroute

//middleware that performs user authentication
export const authToken = async (req, res, next) => {
    try{
        const token = req.cookies.jwt;// accesses JWT token 
        if(!token){ // if no token is found 401
            return res.status(401).send({error: 'Unauthorized: No Token Provided'});
        }
        const decoded = jwt.verify(token.process.env.JWT_SECRET);// decodes and verifes the token
        if(!decoded){ 
            return res.status(401).send({success: false, message: 'Unauthorized: Invalid Token'});
        }
        const user = await User.findById(decoded.userId).select("-password");
        //retrieves the user data from database
         // excludes showing password

        if(!user){ // User check
            return res.status(404).send({success: false, message: 'User not found'});
        }
        req.user =user; // attches the user data to the req object
        next();
    }catch(error){
        return res.status(500).send({success:false, message: 'Internal Server Error, In AuthenticateToken'});
    }
};