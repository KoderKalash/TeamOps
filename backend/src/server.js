import dbConnect from "./config/db.js";
import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT;

const server = async () => {
  await dbConnect();

  app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
  });
};

server();
