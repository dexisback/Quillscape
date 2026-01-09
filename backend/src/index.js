import express from "express";
import cors from "cors";
import axios from "axios";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { verifyAuth } from "./middleware/auth.js";
import { connectDB } from "./db.js";
import blogRoutes from "./routes/blogRoutes.js"

connectDB();
dotenv.config();
const app=express();



app.use(cors());
app.use(express.json());


app.use("/blogs", blogRoutes);


app.get("/", (req, res)=>{
    res.send("Hellow world first ecg");
})


app.post("/test", verifyAuth, (req, res)=>{
        //this route extracts uid from decoded in req, and then sends it to frontend
        res.send(req.user.uid);

})

const PORT= 3000;
app.listen(PORT, ()=>{console.log("Up and runnin' ✅")})