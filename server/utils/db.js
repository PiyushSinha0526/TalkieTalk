import mongoose from "mongoose";

const connectDb = async (url) => {
  if (!url) {
    throw new Error("Database connection URL is required.");
  }

  try {
    await mongoose.connect(url, {
      dbName: "talkieTalk",
    });
    console.log("Database connected successfully.");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1); // Exit process with failure
  }
};

export default connectDb;
