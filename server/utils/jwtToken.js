import jwt from "jsonwebtoken";

const cookieOptions = {
  maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
  sameSite: "none",
  httpOnly: true,
  secure: true,
};

const sendToken = (res, user, status, message) => {
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
  return res.status(status).cookie("jwt-token", token, cookieOptions).json({
    success: true,
    message,
    user,
  });
};

export default sendToken;
export { cookieOptions };
