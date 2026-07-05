import mongoose from "mongoose";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");
    return mongoose.connection;
  } catch (err) {
    console.error("Error Connecting DB", err);
    throw err;
  }
};

export default connectDB;
