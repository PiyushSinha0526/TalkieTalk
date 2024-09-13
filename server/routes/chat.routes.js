import { Router } from "express";
import isAuthenticated from "../middlewares/auth.js";
import {
  getMyChats,
  getMyGroups,
  newGroupChat,
  addMembers,
  removeMembers,
  leaveGroup,
  sendAttachments,
  getChatDetails,
  renameGroup,
  deleteChat,
  getMessages,
} from "../controllers/chat.controllers.js";
import { attachments } from "../middlewares/multer.js";
import {
  addMemberValidator,
  newGroupValidator,
  validateHandler,
  chatIdValidator,
  removeMemberValidator,
  sendAttachmentsValidator,
  renameValidator,
} from "../utils/validators.js";

const app = Router();

app.use(isAuthenticated);

app.post("/new", newGroupValidator(), validateHandler, newGroupChat);
app.get("/myChats", getMyChats);
app.get("/my/groups", getMyGroups);
app.put("/addMembers", addMemberValidator(), validateHandler, addMembers);
app.delete(
  "/removeMember",
  removeMemberValidator(),
  validateHandler,
  removeMembers
);
app.delete("/leave/:id", chatIdValidator(), validateHandler, leaveGroup);
app.post(
  "/message",
  attachments,
  sendAttachmentsValidator(),
  validateHandler,
  sendAttachments
);
app.get("/message/:id", chatIdValidator(), validateHandler, getMessages);
app
  .route("/:id")
  .get(chatIdValidator(), validateHandler, getChatDetails)
  .put(renameValidator(), validateHandler, renameGroup)
  .delete(chatIdValidator(), validateHandler, deleteChat);

export default app;
