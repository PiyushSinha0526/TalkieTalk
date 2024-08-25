import express from "express";
import userRoutes from "./routes/user.routes.js";

const port = process.env.PORT || 8000;

const app = express();

app.use("/user", userRoutes);

app.listen(port, () => {
  console.log("Server is running on port " + port);
});
