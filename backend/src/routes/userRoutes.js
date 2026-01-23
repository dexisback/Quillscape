


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


// Get user profile
router.get('/profile', verifyAuth, async (req, res) => {
    try {
        let user = await User.findOne({ firebaseUid: req.user.uid });
        if (!user) {
            // return res.status(404).json({ msg: "User not found" });
            //since we also have google users, if user does not exist, prob means they are a google user
            user=new User({
                firebaseUid: req.user.uid,
                email: req.user.email
            })
            await user.save();
            console.log("auto created user from firebase token")
        }
        res.status(200).json(user);
    } catch (err) {
        console.error("Error fetching profile:", err);
        res.status(500).json({ msg: "Server error fetching profile" });
    }
});


// Update user profile
router.put('/update', verifyAuth, async (req, res) => {
    try {
        const { username, bio } = req.body;
        const user = await User.findOneAndUpdate(
            { firebaseUid: req.user.uid },
            { username, bio },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }
        res.status(200).json(user);
    } catch (err) {
        console.error("Error updating profile:", err);
        res.status(500).json({ msg: "Server error updating profile" });
    }
});


router.delete("/me", verifyAuth, async (req, res)=>{
    const uid = req.user.uid;
    await Blog.deleteMany({author_uid : uid});
    await User.findOneAndDelete({firebaseUid: uid});
    res.status(200).send("data yeeted")
    
})



export default router;








