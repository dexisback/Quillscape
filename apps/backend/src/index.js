import 'dotenv/config'

import express from "express"
import cors from "cors"
import { connectDB } from "./db.js"
import blogRoutes from "./routes/blogRoutes.js"
import userRoutes from "./routes/userRoutes.js"

const app = express()

/** Always allow local dev origins; merge with FRONTEND_URL(S) so prod deploy + localhost both work */
const defaultOrigins = [
    "https://quillscape.amaanworks.me",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

const fromEnv = process.env.FRONTEND_URLS
    ? process.env.FRONTEND_URLS.split(",").map((o) => o.trim()).filter(Boolean)
    : process.env.FRONTEND_URL
        ? [process.env.FRONTEND_URL.trim()]
        : []

const configuredOrigins = [...new Set([...defaultOrigins, ...fromEnv])]

function isLocalDevOrigin(origin) {
    if (!origin) return false
    try {
        const { hostname } = new URL(origin)
        return hostname === "localhost" || hostname === "127.0.0.1"
    } catch {
        return false
    }
}

app.use(cors({
    origin(origin, callback) {
        if (!origin) return callback(null, true)
        if (configuredOrigins.includes(origin)) return callback(null, true)
        if (isLocalDevOrigin(origin)) return callback(null, true)
        callback(new Error(`CORS blocked: ${origin}`))
    },
    credentials: true,
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