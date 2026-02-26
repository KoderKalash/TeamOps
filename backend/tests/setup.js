import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

let mongoServer;

// Fallbacks for CI if .env.test is missing
process.env.JWT_SECRET ??= "test_jwt_secret";
process.env.JWT_EXPIRY ??= "1d";

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});
