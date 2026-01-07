import express from "express";
import cors from "cors";
import axios from "axios";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config();
const app=express();



app.use(cors());
app.use(express.json());

app.get("/", (req, res)=>{
    res.send("Hellow world first ecg");
})

app.post("/test", (req, res)=>{
    //pehle to jsonify this shit
    const { username, password } = req.body;
    //db verification logic of username and password:
    if(!username){
        res.status(404).send("sorry, invalid creds")
        return 
    }
    //sign the jwt:
    const SECRET=process.env.JWT_SECRET_KEY;
    const token=jwt.sign(username, SECRET);
    res.send(token)
    console.log(username);
    console.log(password);
    
})

const PORT= 3000;
app.listen(PORT, ()=>{console.log("Up and runnin' ✅")})