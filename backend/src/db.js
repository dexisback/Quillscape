import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();


export  async function connectDB(){
    try {
        
    const url=process.env.MONGO_URL;
    if(!url){
        throw new Error("couldnt connect to mongoDB");
    }    

    await mongoose.connect(url);
    console.log("connected to mongoose succesfully ✅");
    } catch (error) {
        console.error("connection to mongoose failed ⚠️")
    }
}

