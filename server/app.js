import express from "express";
import dotenv from "dotenv";

import userRoutes from "./routes/user.routes.js";
import connectDb from "./utils/db.js";

dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 8000;

const app = express();
connectDb(process.env.MONGO_URI);

app.use("/user", userRoutes);

app.listen(port, () => {
  console.log("Server is running on port " + port);
});
