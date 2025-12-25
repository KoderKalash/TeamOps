import mongoose from 'mongoose';

const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log("MongoDB connected Sucessfully")
    } catch (error) {
        console.error("MongoDB failed to connect")
    }
}

export default dbConnect