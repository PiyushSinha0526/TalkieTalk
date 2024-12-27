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
  editProfile,
} from "../controllers/user.controllers.js";
import {
  acceptRequestValidator,
  editProfileValidator,
  loginValidator,
  registerValidator,
  sendRequestValidator,
  validateHandler,
} from "../utils/validators.js";
import { singleUpload } from "../middlewares/multer.js";
import isAuthenticated from "../middlewares/auth.js";

const app = Router();

app.post("/signup", singleUpload, registerValidator(), validateHandler, signup);
app.post("/login", loginValidator(), validateHandler, login);

app.use(isAuthenticated);
app.get("/profile", getProfile);
app.get("/search", searchUser);
app.post("/logout", logout);
app.put(
  "/sendrequest",
  sendRequestValidator(),
  validateHandler,
  sendFriendRequest
);

app.put(
  "/acceptrequest",
  acceptRequestValidator(),
  validateHandler,
  acceptFriendRequest
);
app.get("/notifications", getMyNotifications);
app.get("/friends", getMyFriends);
app.put("/editprofile", editProfileValidator(), validateHandler, editProfile);

export default app;
