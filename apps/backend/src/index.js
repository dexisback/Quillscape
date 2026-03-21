import 'dotenv/config'

import express from "express"
import cors from "cors"
import { connectDB } from "./db.js"
import blogRoutes from "./routes/blogRoutes.js"
import userRoutes from "./routes/userRoutes.js"

const app = express()

const defaultOrigins = [
    "https://quillscape.amaanworks.me",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

const configuredOrigins = process.env.FRONTEND_URLS
    ? process.env.FRONTEND_URLS.split(",").map((origin) => origin.trim()).filter(Boolean)
    : process.env.FRONTEND_URL
        ? [process.env.FRONTEND_URL]
        : defaultOrigins

app.use(cors({
    origin: configuredOrigins,
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