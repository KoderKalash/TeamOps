import mongoose from "mongoose";

const dbConnect = async () => {
  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL is not set");
  }

  await mongoose.connect(process.env.MONGO_URL, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log("MongoDB connected successfully");
};

export default dbConnect;
