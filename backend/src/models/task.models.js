import mongoose from "mongoose";
//error chances
const taskSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        // required: true
    },
    status:{
        type: String,
        enum:["todo","in_progress","done"],
    },
    priority:{
        type: String,
        enum:["high","medium","low"],
    },
    projectId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project" 
    },
    asignedTo:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    dueDate:{
        type: Date,
    }
},{timestamps: true})

const Task = mongoose.model("Task", taskSchema)

export default Task