import express from "express";
import health from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import projectRoutes from "./routes/project.route.js";
import taskRoutes from "./routes/task.route.js";
import projectTask from "./routes/projectTask.route.js";
import userRoute from "./routes/user.route.js";
import errorMiddleware from "./middleware/error.middleware.js";
import limiter from "./middleware/globalLimiter.middleware.js";
import helmet from 'helmet'
import cors from 'cors'

const app = express();

app.set("trust proxy", 1); //trust proxy

app.use(express.json());
app.use(helmet()); 
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use("/api",limiter)
app.use(authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/projects", projectTask);
app.use("/", userRoute);

app.use(errorMiddleware);

export default app;
