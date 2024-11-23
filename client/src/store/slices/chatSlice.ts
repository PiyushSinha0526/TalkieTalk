import { NEW_MESSAGE_ALERT } from "@/constants/socketEvents";
import { getLocalValue } from "@/utils/localStorage";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedChatItem: {
    _id: "",
    groupChat: false,
    profilePic: [],
    name: "",
    creater: "",
    members: [],
  },
  notificationCount: 0,
  newMessagesAlert: getLocalValue(NEW_MESSAGE_ALERT) || [
    {
      chatId: "",
      count: 0,
    },
  ],
};
const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setSelectedChatItem(state, action) {
      state.selectedChatItem = action.payload;
    },
    incrementNotificationCount(state) {
      state.notificationCount += 1;
    },
    resetNotificationCount(state) {
      state.notificationCount = 0;
    },
    setNewMessagesAlert(state, action) {
      const index = state.newMessagesAlert.findIndex(
        (item: any) => item.chatId === action.payload.chatId,
      );

      if (index !== -1) {
        state.newMessagesAlert[index].count += 1;
      } else {
        state.newMessagesAlert.push({
          chatId: action.payload.chatId,
          count: 1,
        });
      }
    },
    removeNewMessagesAlert(state, action) {
      state.newMessagesAlert = state.newMessagesAlert.filter(
        (item: any) => item.chatId !== action.payload,
      );
    },
  },
});

export const {
  setSelectedChatItem,
  incrementNotificationCount,
  resetNotificationCount,
  setNewMessagesAlert,
  removeNewMessagesAlert,
} = chatSlice.actions;
export default chatSlice;
