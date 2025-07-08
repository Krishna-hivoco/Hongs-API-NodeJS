import mongoose from "mongoose";
import { config } from "dotenv";
config();
const connectDB = async () => {
  try {
    const uri = process.env.MONGOOSE_URI;
    await mongoose.connect(uri);
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(
      "Available collections:",
      collections.map((c) => c.name)
    );
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};
connectDB();
