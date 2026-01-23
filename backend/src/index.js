import 'dotenv/config';  //stupid mistake, wasnt calling dotenv sabse pehle, shouldve dont that 

import express from "express";
import cors from "cors";
import axios from "axios";
import jwt from "jsonwebtoken"
import { verifyAuth } from "./middleware/auth.js";
import { connectDB } from "./db.js";
import blogRoutes from "./routes/blogRoutes.js"
import userRoutes from "./routes/userRoutes.js"
connectDB();
const app=express();



app.use(cors());
app.use(express.json());


app.use("/blogs", blogRoutes);
app.use("/blogs/users", userRoutes);


app.get("/", (req, res)=>{
    res.send("Hellow world first ecg");
})

app.get("/health", (req, res)=>{
    res.status(200).send("alive and runnnin")
})

const PORT= process.env.PORT || 3000 ;
app.listen(PORT, ()=>{console.log("Up and runnin' ✅")})