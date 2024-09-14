
import { exceptionHandler } from "../middlewares/error.js";
import { Chat } from "../models/chat.js";

const newGroupChat = exceptionHandler(async (req, res) => {
  const { name } = req.body;
  // if (!members && members.length < 2) {
  //   return next(new errorHandler("Please add at least 2 members", 400));
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

});

const removeMembers = exceptionHandler(async (req, res, next) => {

});

const leaveGroup = exceptionHandler(async (req, res, next) => {

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
