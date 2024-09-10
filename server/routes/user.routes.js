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
import {
  acceptRequestValidator,
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
app.get("/logout", logout);
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

export default app;
