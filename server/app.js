import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { v2 } from "cloudinary";

import userRoutes from "./routes/user.routes.js";
import chatRoutes from "./routes/chat.routes.js";

import connectDb from "./utils/db.js";
import errorMiddleware from "./middlewares/error.js";

dotenv.config({
  path: "./.env",
});
v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const port = process.env.SERVER_PORT || 8000;
export const envMode = process.env.NODE_ENV.trim() || "PRODUCTION";

connectDb(process.env.MONGO_URI);
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // Allow this origin only
    credentials: true, // Allow credentials
  })
);
app.use("/user", userRoutes);
app.use("/chat", chatRoutes);

app.use(errorMiddleware);
app.listen(port, () => {
  console.log("Server is running on port " + port);
});
