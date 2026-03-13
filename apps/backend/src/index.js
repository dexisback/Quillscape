import 'dotenv/config'

import express from "express"
import cors from "cors"
import { connectDB } from "./db.js"
import blogRoutes from "./routes/blogRoutes.js"
import userRoutes from "./routes/userRoutes.js"

const app = express()

app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL || 'https://quillscape.amaanworks.me'
        : ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
}))
app.use(express.json({ limit: '10mb' })) //increased limit

app.use("/blogs", blogRoutes)
app.use("/blogs/users", userRoutes)

app.get("/", (req, res) => {
    res.send("Quillscape API")
})

app.get("/health", (req, res) => {
    res.status(200).send("alive")
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log("Server running on port " + PORT)
    connectDB(); //fix
})