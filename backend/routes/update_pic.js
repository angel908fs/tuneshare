const express = require("express");
let router = express.Router();
const User = mongoose.model("User")


router.put('/update-pic', async,(req,res)=>{
    User.findByIdAndUpdate(req.user._id,{$set:{profile_picture:req.body.pic}},{new:true},
        (err,result)=>{
         if(err){
             return res.status(422).json({error:"picture can't be updated"})
         }
         res.json(result)
    })
})

module.exports = router;
