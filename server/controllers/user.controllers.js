import { compare } from "bcrypt";
import { User } from "../models/user.js";
import sendToken, { cookieOptions } from "../utils/jwtToken.js";
import { exceptionHandler } from "../middlewares/error.js";
import ErrorHandler from "../utils/errorHandler.js";
import { Chat } from "../models/chat.js";
import { Request } from "../models/request.js";
// -------------
const signup = exceptionHandler(async (req, res) => {
  const { name, userName, password } = req.body;
  // TODO: profilePic
  // const file = req.file
  // if(!file) return next(ErrorHandler("Please Upload Avatar"))

  //   const result = await uploadFilesToCloudinary([file])

  // const profilePic = {
  //   public_id: result[0].public_id,
  //   url: result[0].url,
  // };

  const user = await User.create({ name, userName, password });
  sendToken(res, user, 201, "User Created Successfully");
});

const login = exceptionHandler(async (req, res, next) => {
  const { userName, password } = req.body;

  const user = await User.findOne({ userName }).select("+password").lean();
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const isMatch = await compare(password, user.password);
  if (!isMatch) {
    return next(new ErrorHandler("Incorrect Password", 401));
  }
  delete user.password;
  sendToken(res, user, 200, "User logged in Successfully");
});

const getProfile = exceptionHandler(async (req, res) => {
  const user = await User.findById(req._id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
  res.status(200).json({
    success: true,
    user,
  });
});

const logout = exceptionHandler(async (req, res) => {
  res
    .status(200)
    .cookie("jwt-token", null, {
      ...cookieOptions,
      maxAge: 0,
    })
    .json({
      success: true,
      message: "User logged out successfully",
    });
});

const searchUser = exceptionHandler(async (req, res) => {
  const { name = "" } = req.query;

  // Finding All my chats
  const myChats = await Chat.find({ groupChat: false, members: req._id });

  //  extracting All Users from my chats means friends or people I have chatted with
  const allUsersFromMyChats = myChats.flatMap((chat) => chat.members);

  allUsersFromMyChats.push(req._id);
  // Finding all users except me and my friends
  const allUsersExceptMeAndFriends = await User.find({
    _id: { $nin: allUsersFromMyChats },
    name: { $regex: name, $options: "i" },
  });

  // Modifying the response
  const users = allUsersExceptMeAndFriends.map(({ _id, name, profilePic }) => ({
    _id,
    name,
    profilePic: profilePic.url,
  }));

  return res.status(200).json({
    success: true,
    users,
  });
});

const sendFriendRequest = exceptionHandler(async (req, res, next) => {
  const { userId } = req.body;

  const request = await Request.findOne({
    $or: [
      { sender: req._id, receiver: userId },
      { sender: userId, receiver: req._id },
    ],
  });

  if (request) return next(new ErrorHandler("Request already sent", 400));

  await Request.create({
    sender: req._id,
    receiver: userId,
  });

  return res.status(200).json({
    success: true,
    message: "Friend Request Sent",
  });
});

const acceptFriendRequest = exceptionHandler(async (req, res, next) => {
  const { requestId, accept } = req.body;

  const request = await Request.findById(requestId)
    // .populate("sender", "name")
    // .populate("receiver", "name");
  if (!request) return next(new ErrorHandler("Request not found", 404));

  if (request.receiver._id.toString() !== req._id.toString())
    return next(
      new ErrorHandler("You are not authorized to accept this request", 401)
    );

  if (!accept) {
    await request.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Friend Request Rejected",
    });
  }

  const members = [request.sender._id, request.receiver._id];

  await Promise.all([
    Chat.create({
      members,
      name: `${request.sender.name}-${request.receiver.name}`,
    }),
    request.deleteOne(),
  ]);

  return res.status(200).json({
    success: true,
    message: "Friend Request Accepted",
    senderId: request.sender._id,
  });
});

const getMyNotifications = exceptionHandler(async (req, res) => {
  const requests = await Request.find({ receiver: req._id }).populate(
    "sender",
    "name profilePic userName"
  );
  const allRequests = requests.map(({ _id, sender }) => ({
    _id,
    sender: {
      _id: sender._id,
      name: sender.name,
      userName: sender.userName,
      profilePic: sender.profilePic.url,
    },
  }));
  return res.status(200).json({
    success: true,
    allRequests,
  });
});

export const getOtherMember = (members, userId) =>
  members.find((member) => member._id.toString() !== userId.toString());


const getMyFriends = exceptionHandler(async (req, res) => {
  const chatId = req.query.chatId;

  const chats = await Chat.find({
    members: req._id,
    groupChat: false,
  }).populate("members", "name userName profilePic");

  const friends = chats.map(({ members }) => {
    const otherUser = getOtherMember(members, req._id);
    
    return {
      _id: otherUser._id,
      name: otherUser.name,
      userName: otherUser.userName,
      profilePic: otherUser.profilePic.url,
    };
  });

  if (chatId) {
    const chat = await Chat.findById(chatId);

    const availableFriends = friends.filter(
      (friend) => !chat.members.includes(friend._id)
    );

    return res.status(200).json({
      success: true,
      friends: availableFriends,
    });
  } else {
    return res.status(200).json({
      success: true,
      friends,
    });
  }
});

export {
  signup,
  login,
  getProfile,
  searchUser,
  logout,
  sendFriendRequest,
  acceptFriendRequest,
  getMyNotifications,
  getMyFriends,
};
