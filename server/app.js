import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";
import { v4 as uuid } from "uuid";
import { v2 } from "cloudinary";
import userRoutes from "./routes/user.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import connectDb from "./utils/db.js";
import errorMiddleware from "./middlewares/error.js";
import { NEW_MESSAGE, NEW_MESSAGE_ALERT, START_TYPING, STOP_TYPING } from "./constants/event.js";
import { socketAuthenticator } from "./middlewares/auth.js";
import { Message } from "./models/message.js";
import { getSockets } from "./lib/helper.js";

dotenv.config({
  path: "./.env",
});
v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const port = process.env.PORT || 8000;
export const envMode = process.env.NODE_ENV.trim() || "PRODUCTION";
export const userSocketIDs = new Map();
const onlineUsers = new Set();

connectDb(process.env.MONGO_URI);
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true, // Allow credentials
  },
});
app.set("io", io);

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // Allow this origin only
    credentials: true, // Allow credentials
  })
);
io.use((socket, next) => {
  cookieParser()(
    socket.request,
    socket.response,
    async (err) => await socketAuthenticator(err, socket, next)
  );
});
app.use("/user", userRoutes);
app.use("/chat", chatRoutes);
io.on("connection", (socket) => {
  console.log('connnected')
  let user = socket.user;
  userSocketIDs.set(user._id.toString(), socket.id);
  // Listen for NEW_MESSAGE event
  socket.on(NEW_MESSAGE, async ({ chatId, members, messages }) => {
    // for Socket
    console.log(members, messages);
    const messagesForRealTime = {
      content: messages,
      _id: uuid(),
      sender: {
        _id: user._id,
        name: user.name,
      },
      chatId: chatId,
      createdAt: new Date().toISOString(),
    };
    // for saving to DB
    const messageForDB = {
      content: messages,
      sender: user._id,
      chat: chatId,
    };
    const memberSocket = getSockets([...members]);
    io.to(memberSocket).emit(NEW_MESSAGE, {
      chatId,
      message: messagesForRealTime,
    });
    io.to(memberSocket).emit(NEW_MESSAGE_ALERT, { chatId });
    try {
      await Message.create(messageForDB);
    } catch (error) {
      console.log(error);
    }
  });

  socket.on(START_TYPING, ({ members, chatId }) => {
    console.log(members, chatId);
    const memberSocket = getSockets([...members]);
    socket.to(memberSocket).emit(START_TYPING, { chatId });
  })
  socket.on(STOP_TYPING, ({ members, chatId }) => {
    console.log(members, chatId);
    const memberSocket = getSockets([...members]);
    socket.to(memberSocket).emit(STOP_TYPING, { chatId });
  })

  socket.on("disconnect", () => {
    userSocketIDs.delete(user._id.toString());
    console.log("disconnected");
  });
});


app.use(errorMiddleware);
app.listen(port, () => {
  console.log("Server is running on port " + port);
});
