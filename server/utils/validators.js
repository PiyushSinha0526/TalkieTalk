import { body, validationResult } from "express-validator";
import ErrorHandler from "../utils/errorHandler.js";

// TODO?: revisit this again for refactors and cleanups

const validateHandler = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const errorMessages =
    errors
      .array()
      .map((error) => error.msg)
      .join(", ") || "Validation failed";

  next(new ErrorHandler(errorMessages, 400));
};

const registerValidator = () => [
  body("name", "Name is required").notEmpty(),
  body("userName", "Username is required").notEmpty(),
  body("password", "Password is required").notEmpty(),
];

const loginValidator = () => [
  body("userName", "Username is required").notEmpty(),
  body("password", "Password is required").notEmpty(),
];

const sendRequestValidator = () => [
  body("userId", "User ID is required").notEmpty(),
];

const acceptRequestValidator = () => [
  body("requestId", "Request ID is required").notEmpty(),
  body("accept")
    .notEmpty()
    .withMessage("Accept field is required")
    .isBoolean()
    .withMessage("Accept must be a boolean"),
];

export {
  acceptRequestValidator,
  loginValidator,
  registerValidator,
  sendRequestValidator,
  validateHandler,
};
