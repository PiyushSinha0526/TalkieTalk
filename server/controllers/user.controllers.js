import { compare } from "bcrypt";
import { User } from "../models/user.js";
import sendToken, { cookieOptions } from "../utils/jwtToken.js";
import { exceptionHandler } from "../middlewares/error.js";
import ErrorHandler from "../utils/errorHandler.js";

const signup = exceptionHandler(async (req, res) => {
  console.log('singup ----', req.body)
  const { name, userName, password } = req.body;
  // TODO: profilePic

  const user = await User.create({ name, userName, password });
  sendToken(res, user, 201, "User Created Successfully");
});

const login = exceptionHandler(async (req, res, next) => {
  console.log('login ----', req.body)
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

function sendFriendRequest(req, res) {
  // TODO: implement sendFriendRequest
}

function acceptFriendRequest(req, res) {
  // TODO: implement acceptFriendRequest
}

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
