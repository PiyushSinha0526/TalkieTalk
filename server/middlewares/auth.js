import jwt from "jsonwebtoken";
import errorHandler from "../utils/errorHandler.js";

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


export default isAuthenticated;
