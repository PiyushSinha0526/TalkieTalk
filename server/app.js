import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import userRoutes from "./routes/user.routes.js";
import chatRoutes from "./routes/chat.routes.js";

import connectDb from "./utils/db.js";
import errorMiddleware from "./middlewares/error.js";

dotenv.config({
  path: "./.env",
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
