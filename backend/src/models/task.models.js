import mongoose from "mongoose";
//error chances
const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        // required: true
    },
    status: {
        type: String,
        enum: ["todo", "in_progress", "done"],
        default: "todo",
        required: true
    },
    priority: {
        type: String,
        enum: ["high", "medium", "low"],
        default: "medium"
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    dueDate: {
        type: Date,
    }
}, { timestamps: true })

//search idx
taskSchema.index({title})
taskSchema.index({description})

//sort idx
taskSchema.index({"priority": "high"})
taskSchema.index({"createdAt": -1})

const Task = mongoose.model("Task", taskSchema)

export default Task