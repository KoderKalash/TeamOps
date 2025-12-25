import express from "express"
import health from "./routes/user.route.js"

const app = express()

app.use(express.json())
app.use(health)

export default app