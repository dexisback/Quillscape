//this file handles all the routes related to blogs in my website:

//gonna define all blog CRUD logic, blog get/blog create/blog edit/blog delete


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



//ye to latest news hai, 
router.get("/profile", verifyAuth, async(req, res)=>{
    try {
        const firebaseUid= req.user.uid;
        const user= await User.findOne({firebaseUid: firebaseUid})
        if(!user){return res.status(404).json({msg: "sorry user not found in my db"})}
        //but if user DOES exist:
        res.json(user); //send the full user data object to the FE, i will parse it over there to get whatever i want
    } catch (err) {
        console.error("sorry some err happened in sending the req to /blogs/users/profile", err);
    }
})


router.put("/update", verifyAuth, async (req, res)=>{
    try {
        const firebaseUid= req.user.uid;
        const updates= req.body; 
        const updatedUser = await User.findOneAndUpdate(
            { firebaseUid : firebaseUid },
            { $set: updates },
            { new: true }
        )
        res.json(updatedUser);

    } catch (err) {
        console.error("error in the backend of updating the name, email (put route) ", err);
        res.status(500).send({msg : "failed to update profile"})
    }
})
export default router;








