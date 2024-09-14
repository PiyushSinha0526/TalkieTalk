
import { exceptionHandler } from "../middlewares/error.js";
import { Chat } from "../models/chat.js";
import { User } from "../models/user.js";
import ErrorHandler from "../utils/errorHandler.js";

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

  return res.status(200).json({
    success: true,
    message: "Members added successfully",
  });
});

const removeMembers = exceptionHandler(async (req, res, next) => {
  const { chatId, userId } = req.body;

  const [chat] = await Promise.all([
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

  await chat.save();


  return res.status(200).json({
    success: true,
    message: "Member removed successfully",
  });
});

const sendAttachments = exceptionHandler(async (req, res, next) => {

});

const getChatDetails = exceptionHandler(async (req, res, next) => {

});

const renameGroup = exceptionHandler(async (req, res, next) => {

});

const deleteChat = exceptionHandler(async (req, res, next) => {

});

const getMessages = exceptionHandler(async (req, res, next) => {
  
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
