import { body, param, validationResult } from "express-validator";
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

const newGroupValidator = () => [
  body("name", "Group name is required").notEmpty(),
  // body("members")
  //   .notEmpty()
  //   .withMessage("Please Enter Members")
  //   .isArray({ min: 2, max: 100 })
  //   .withMessage("Members must be 2-100"),
];

const addMemberValidator = () => [
  body("chatId", "Chat ID is required").notEmpty(),
  // body("members")
  //   .notEmpty()
  //   .withMessage("Please Enter Members")
  //   .isArray({ min: 1, max: 97 })
  //   .withMessage("Members must be 1-97"),
];

const removeMemberValidator = () => [
  body("chatId", "Chat ID is required").notEmpty(),
  body("userId", "User ID is required").notEmpty(),
];

const sendAttachmentsValidator = () => [
  body("chatId", "Chat ID is required").notEmpty(),
];

const chatIdValidator = () => [param("id", "Chat ID is required").notEmpty()];

const renameValidator = () => [
  param("id", "Chat ID is required").notEmpty(),
  body("name", "New name is required").notEmpty(),
];
const editProfileValidator = () => [
  body("userName", "UserName is required").notEmpty(),
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
  addMemberValidator,
  chatIdValidator,
  loginValidator,
  newGroupValidator,
  registerValidator,
  removeMemberValidator,
  renameValidator,
  sendAttachmentsValidator,
  sendRequestValidator,
  validateHandler,
  editProfileValidator,
};
