import { compare } from "bcrypt";
import { User } from "../models/user.js";
import sendToken, { cookieOptions } from "../utils/jwtToken.js";
import { exceptionHandler } from "../middlewares/error.js";
import ErrorHandler from "../utils/errorHandler.js";

const signup = exceptionHandler(async (req, res) => {
  const { name, userName, password } = req.body;
  // TODO: profilePic

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

function searchUser(req, res) {
  // TODO: implement searchUser
}

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

// TODO: Socket emit.
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

// TODO: Socket emit.
const acceptFriendRequest = exceptionHandler(async (req, res, next) => {
  const { requestId, accept } = req.body;

  const request = await Request.findById(requestId)
    // .populate("sender", "name")
    // .populate("receiver", "name");
  if (!request) return next(new errorHandler("Request not found", 404));

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

function getMyNotifications(req, res) {
  // TODO: implement getMyNotifications
}

function getMyFriends(req, res) {
  // TODO: implement getMyFriends
}

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
