import express from "express"
import health from "./routes/user.route.js"
import authRoutes from "./routes/auth.route.js"
import projectRoutes from "./routes/project.route.js"
// import userRoute from "./routes/user.route.js"

const app = express()

app.use(express.json())
app.use(health)
app.use(authRoutes)
app.use("/api/projects",projectRoutes)
// app.use(userRoute)

export default app