import express from "express";
import protect from "../middleware/auth.middleware.js";
import User from "../models/user.models.js";
import restrictTo from "../middleware/role.middleware.js";

const router = express.Router();

/*router.get("/users",protect,restrictTo("admin"),async (req, res)=>{
    try {
        // find({}) returns an array of all documents in the 'users' collection
        const users = await User.find({});
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }})
        */

router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
  });
});

export default router;
