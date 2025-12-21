import express from "express";
import cors from "cors";

const app=express();



app.use(cors());
app.use(express.json());

app.get("/", (req, res)=>{
    res.send("Hellow world first ecg")
})

const PORT= 5000;
app.listen(PORT, ()=>{console.log("Up and runnin'")})