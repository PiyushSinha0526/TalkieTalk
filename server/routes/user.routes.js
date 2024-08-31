import { Router } from "express";
import {
  acceptFriendRequest,
  getMyFriends,
  getMyNotifications,
  getProfile,
  login,
  logout,
  signup,
  searchUser,
  sendFriendRequest,
} from "../controllers/user.controllers.js";
import { loginValidator, registerValidator, validateHandler } from "../utils/validators.js";
import { singleUpload } from "../middlewares/multer.js";

const app = Router();

app.post("/signup", singleUpload, registerValidator(), validateHandler, signup);
app.post("/login", loginValidator(), validateHandler, login);


app.get("/profile", getProfile);
app.get("/search", searchUser);
app.get("/logout", logout);
app.put("/sendrequest", sendFriendRequest);
app.put("/acceptrequest", acceptFriendRequest);
app.get("/notifications", getMyNotifications);
app.get("/friends", getMyFriends);

export default app;
