import express from "express";
import cors from "cors";
import axios from "axios";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { verifyAuth } from "./middleware/auth.js";
import { connectDB } from "./db.js";
import blogRoutes from "./routes/blogRoutes.js"
import userRoutes from "./routes/userRoutes.js"
connectDB();
dotenv.config();
const app=express();



app.use(cors());
app.use(express.json());


app.use("/blogs", blogRoutes);
app.use("/blogs/users", userRoutes);


app.get("/", (req, res)=>{
    res.send("Hellow world first ecg");
})


app.post("/test", verifyAuth, (req, res)=>{
        res.send(req.user.uid);

})


const PORT= process.env.port || 3000 ;
app.listen(PORT, ()=>{console.log("Up and runnin' ✅")})