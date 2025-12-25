import mongoose from "mongoose";
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["user", "manager", "admin"],
        default: "admin" //change it
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true })

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return; //avoids double hashing
    this.password = await bcrypt.hash(this.password, 10)
})

const User = mongoose.model("User", userSchema)

export default User