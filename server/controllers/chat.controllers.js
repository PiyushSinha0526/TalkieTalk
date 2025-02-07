import {
  ALERT,
  NEW_ATTACHMENT,
  NEW_MESSAGE,
  NEW_MESSAGE_ALERT,
  REFETCH_CHATS,
} from "../constants/event.js";
import { exceptionHandler } from "../middlewares/error.js";
import { Chat } from "../models/chat.js";
import { User } from "../models/user.js";
import { Message } from "../models/message.js";
import emitEvent from "../utils/emit.js";
import ErrorHandler from "../utils/errorHandler.js";
import {
  deletFilesFromCloudinary,
  uploadFilesToCloudinary,
} from "../utils/cloudinary.js";

const newGroupChat = exceptionHandler(async (req, res) => {
  const { name } = req.body;
  // if (!members && members.length < 2) {
  //   return next(new ErrorHandler("Please add at least 2 members", 400));
  // }
  // const allMembers = [ req._id];
  const group = await Chat.create({
    name,
    groupChat: true,
    creater: req._id,
    members: [req._id],
  });
  // emitEvent(req, ALERT, allMembers, `WELCOME TO ${name} Group.`);
  // emitEvent(req, REFETCH_CHATS, members);

  return res.status(201).json({
    success: true,
    message: "Group chat created successfully",
    group,
  });
});

export const getOtherMember = (members, userId) =>
  members.find((member) => member._id.toString() !== userId.toString());

const getMyChats = exceptionHandler(async (req, res) => {
  const chats = await Chat.find({ members: req._id }).populate(
    "members",
    "name profilePic creater"
  );
  const transformChat = chats.map(({ _id, name, members, groupChat, creater }) => {
    const otherMember = getOtherMember(members, req._id);

    return {
      _id,
      groupChat,
      creater: groupChat? creater.toString() : null,
      profilePic: groupChat
        ? members.slice(0, 3).map(({ profilePic }) => profilePic.url)
        : [otherMember.profilePic.url],
      name: groupChat ? name : otherMember.name,
      members: members.reduce((prev, curr) => {
        if (curr._id.toString() !== req._id.toString()) {
          prev.push(curr._id);
        }
        return prev;
      }, []),
    };
  });

  return res.status(200).json({
    success: true,
    chats: transformChat,
  });
});

const getMyGroups = exceptionHandler(async (req, res) => {
  const chats = await Chat.find({ creater: req._id }).populate(
    "members",
    "name profilePic"
  );
  const groups = chats.map(({ _id, name, members, groupChat }) => {
    const x = members.reduce((prev, curr) => {
      if (curr._id.toString() !== req._id.toString()) {
        prev.push(curr._id);
      }
      return prev;
    }, [])
    return {
      _id,
      groupChat,
      name,
      creater: req._id.toString(),
      profilePic: groupChat
        ? members.slice(0, 3).map(({ profilePic }) => profilePic.url)
        : [],
      members: members.reduce((prev, curr) => {
        if (curr._id.toString() !== req._id.toString()) {
          prev.push(curr._id);
        }
        return prev;
      }, []),
    };
  });
  return res.status(200).json({
    success: true,
    groups,
  });
});

const addMembers = exceptionHandler(async (req, res, next) => {
  const { chatId, members } = req.body;

  if (!members || members.length < 1) {
    return next(new ErrorHandler("Please add at least 1 member", 400));
  }

  const chat = await Chat.findById(chatId);

  if (!chat) next(new ErrorHandler("Chat not found", 404));
  if (!chat.groupChat) next(new ErrorHandler("Not a Group chat", 404));

  if (chat.creater.toString() !== req._id.toString()) {
    return next(new ErrorHandler("Only creater can add members", 401));
  }
  const allNewMembersPromise = members.map((i) => User.findById(i, "name"));
  const allNewMembers = await Promise.all(allNewMembersPromise);
  const uniqueMembers = allNewMembers
    .filter((i) => !chat.members.includes(i._id.toString()))
    .map((i) => i._id);
  chat.members.push(...uniqueMembers);

  if (chat.members.length > 50)
    return next(ErrorHandler("Too many members", 400));

  await chat.save();

  const userAddedName = allNewMembers.map((i) => i.name).join(", ");

  emitEvent(req, ALERT, chat.members, `${userAddedName} added to ${chat.name}`);
  // emitEvent(req, REFETCH_CHATS, chat.members);
  return res.status(200).json({
    success: true,
    message: "Members added successfully",
  });
});

const removeMembers = exceptionHandler(async (req, res, next) => {
  const { chatId, userId } = req.body;

  const [chat, userToRemove] = await Promise.all([
    Chat.findById(chatId),
    User.findById(userId, "name"),
  ]);
  if (!chat) next(new ErrorHandler("Chat not found", 404));
  if (!chat.groupChat) next(new ErrorHandler("Not a Group chat", 404));

  if (chat.creater.toString() !== req._id.toString()) {
    return next(new ErrorHandler("Only creater can add members", 401));
  }
  // if (chat.members.length <= 3) {
  //   return next(new ErrorHandler("Cannot remove all members", 400));
  // }
  chat.members = chat.members.filter(
    (member) => member.toString() !== userId.toString()
  );

  await chat.save();

  emitEvent(
    req,
    ALERT,
    chat.members,
    `${userToRemove.name} removed from the group`
  );
  // emitEvent(req, REFETCH_CHATS, chat.members);
  return res.status(200).json({
    success: true,
    message: "Member removed successfully",
  });
});

const leaveGroup = exceptionHandler(async (req, res, next) => {
  const chatId = req.params.id;

  const chat = await Chat.findById(chatId);
  if (!chat) next(new ErrorHandler("Chat not found", 404));
  if (!chat.groupChat) next(new ErrorHandler("Not a Group chat", 404));

  const otherMember = chat.members.filter(
    (member) => member.toString() !== req._id.toString()
  );

  // if (otherMember.length < 3) {
  //   return next(new ErrorHandler("Group must have at least 3 members", 400));
  // }

  if (chat.creater.toString() === req._id.toString()) {
    const newCreater = otherMember[0];
    chat.creater = newCreater;
  }

  chat.members = otherMember;

  const [user] = await Promise.all([
    User.findById(req._id, "name"),
    chat.save(),
  ]);

  emitEvent(req, ALERT, chat.members, `${user.name} left the group.`);

  return res.status(200).json({
    success: true,
    message: "Member removed successfully",
  });
});

const sendAttachments = exceptionHandler(async (req, res, next) => {
  const { chatId } = req.body;
  const [chat, user] = await Promise.all([
    Chat.findById(chatId),
    User.findById(req._id, "name"),
  ]);

  if (!chat) next(new ErrorHandler("Chat not found", 404));

  const files = req.files || [];
  if (files.length < 1) {
    return next(new ErrorHandler("Please attach atleast one file", 400));
  }
  if (files.length > 5) {
    return next(new ErrorHandler("Cannot attach more than 5 files", 400));
  }

  // Upload to Cloudinary
  const attachments = await uploadFilesToCloudinary(files);

  const MessageForRealTime = {
    content: "",
    attachments,
    sender: {
      _id: user._id,
      name: user.name,
    },
    chat: chatId,
  };

  const MessageForDB = {
    content: "",
    attachments,
    sender: user._id,
    chat: chatId,
  };
  const message = await Message.create(MessageForDB);
  emitEvent(req, NEW_MESSAGE, chat.members, {
    message: MessageForRealTime,
    chatId,
  });

  emitEvent(req, NEW_MESSAGE_ALERT, chat.members, { chatId });

  return res.status(200).json({
    success: true,
    message,
  });
});

const getChatDetails = exceptionHandler(async (req, res, next) => {
  if (req.query.populate === "true") {
    const chat = await Chat.findById(req.params.id)
      .populate("members", "name userName profilePic")
      .lean();

    if (!chat) return next(new ErrorHandler("Chat not found", 404));

    chat.members = chat.members.map(({ _id, name, userName, profilePic }) => ({
      _id,
      name,
      userName,
      profilePic: profilePic?.url,
    }));

    return res.status(200).json({
      success: true,
      chat,
    });
  } else {
    const chat = await Chat.findById(req.params.id);
    if (!chat) return next(new ErrorHandler("Chat not found", 404));

    return res.status(200).json({
      success: true,
      chat,
    });
  }
});

const renameGroup = exceptionHandler(async (req, res, next) => {
  const chatId = req.params.id;
  const { name } = req.body;

  const chat = await Chat.findById(chatId);

  if (!chat) return next(new ErrorHandler("Chat not found", 404));

  if (!chat.groupChat)
    return next(new ErrorHandler("This is not a group chat", 400));

  if (chat.creater.toString() !== req._id.toString())
    return next(
      new ErrorHandler("You are not allowed to rename the group", 403)
    );

  chat.name = name;
  await chat.save();

  emitEvent(req, REFETCH_CHATS, chat.members, 'Group renamed to ' + name);

  return res.status(200).json({
    success: true,
    message: "Group renamed successfully",
  });
});

const deleteChat = exceptionHandler(async (req, res, next) => {
  const chatId = req.params.id;

  const chat = await Chat.findById(chatId);

  if (!chat) return next(new ErrorHandler("Chat not found", 404));

  const members = chat.members;

  if (chat.groupChat && chat.creater.toString() !== req._id.toString())
    return next(
      new ErrorHandler("You are not allowed to delete the group", 403)
    );

  if (!chat.groupChat && !chat.members.includes(req._id.toString())) {
    return next(
      new ErrorHandler("You are not allowed to delete the chat", 403)
    );
  }

  //   Here we have to delete All Messages as well as attachments or files from cloudinary

  const messagesWithAttachments = await Message.find({
    chat: chatId,
    attachments: { $exists: true, $ne: [] },
  });

  const public_ids = [];

  messagesWithAttachments.forEach(({ attachments }) =>
    attachments.forEach(({ public_id }) => public_ids.push(public_id))
  );

  await Promise.all([
    deletFilesFromCloudinary(public_ids),
    chat.deleteOne(),
    Message.deleteMany({ chat: chatId }),
  ]);

  emitEvent(req, REFETCH_CHATS, members);

  return res.status(200).json({
    success: true,
    message: "Chat deleted successfully",
  });
});

const getMessages = exceptionHandler(async (req, res, next) => {
  const chatId = req.params.id;
  const { page = 1 } = req.query;

  const maxLimit = 20;
  const skip = (page - 1) * maxLimit;

  const chat = await Chat.findById(chatId);

  if (!chat) return next(new ErrorHandler("Chat not found", 404));

  if (!chat.members.includes(req._id.toString()))
    return next(
      new ErrorHandler("You are not allowed to access this chat", 403)
    );

  const [messages, totalMessagesCount] = await Promise.all([
    Message.find({ chat: chatId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(maxLimit)
      .populate("sender", "name")
      .lean(),
    Message.countDocuments({ chat: chatId }),
  ]);

  const totalPages = Math.ceil(totalMessagesCount / maxLimit) || 0;

  return res.status(200).json({
    success: true,
    messages: messages.reverse(),
    totalPages,
  });
});

export {
  addMembers,
  getMyChats,
  getMyGroups,
  leaveGroup,
  newGroupChat,
  removeMembers,
  sendAttachments,
  getChatDetails,
  renameGroup,
  deleteChat,
  getMessages,
};
