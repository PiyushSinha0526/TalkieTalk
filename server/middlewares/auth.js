import jwt from "jsonwebtoken";
import errorHandler from "../utils/errorHandler.js";
import { User } from "../models/user.js";

const isAuthenticated = (req, res, next) => {
  const token = req.cookies["jwt-token"];
  if (!token) {
    return next(new errorHandler("User not authenticated", 401));
  }

  const verifiedToken = jwt.verify(token, process.env.JWT_SECRET);
  if (!verifiedToken) {
    return next(new errorHandler("User not authenticated", 401));
  }
  req._id = verifiedToken._id;
  next();
};

const socketAuthenticator = async(err, socket, next) => {
  try {
    if(err) return next(err);
    const authToken = socket.request.cookies["jwt-token"];
    if (!authToken) {
      return next(new errorHandler("User not authenticated", 401));
    }
    const decodedToken = jwt.verify(authToken, process.env.JWT_SECRET);
    const user = await User.findById(decodedToken._id);
    if(!user) {
      return next(new errorHandler("User not authenticated", 401));
    }
    socket.user = user; 
    return next();
  } catch (error) {
    return next(new errorHandler("User not authenticated", 401));
  }
};

export default isAuthenticated;
export { socketAuthenticator };
