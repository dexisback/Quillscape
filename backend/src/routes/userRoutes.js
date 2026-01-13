


import express from "express";
import axios from "axios";
import { verifyAuth } from "../middleware/auth.js";
import User from "../models/User.js";
import Blog from "../models/Blog.js";

const router = express.Router();

//sync ka post route
router.post('/sync', async (req, res)=>{
    try {
        const { firebaseUid, email } = req.body;
        let user= await User.findOne({ firebaseUid })
        if(!user){
            user= new User({firebaseUid, email})
            await user.save();
            console.log(" this nigga didnt exist before but now they exist, user saved in mongo");

        }
        res.status(200).json(user);
    } catch (err) {
        console.error("failed", err);
            res.status(500).send({msg: "sorry server error during sync"});
        
    }
})


router.delete("/me", verifyAuth, async (req, res)=>{
    const uid = req.user.uid;
    await Blog.deleteMany({author_uid : uid});
    await User.findOneAndDelete({firebaseUid: uid});
    res.status(200).send("data yeeted")
    
})



export default router;








