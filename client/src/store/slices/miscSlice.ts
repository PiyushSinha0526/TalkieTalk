import { ChatType } from "@/types/types";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isMobile: false,
  chatType: "all" as ChatType,
  isFileMenuOpen: false,
  isProfileOpen: false,
};
const miscSlice = createSlice({
  name: "misc",
  initialState,
  reducers: {
    setIsMobile(state, action) {
      state.isMobile = action.payload;
    },
    setChatType(state, action) {
      state.chatType = action.payload;
    },
    setIsFileMenuOpen(state, action) {
      state.isFileMenuOpen = action.payload;
    },
    setIsProfileOpen: (state, action) => {
      state.isProfileOpen = action.payload;
    }
  },
});

export const { setIsMobile, setChatType, setIsFileMenuOpen, setIsProfileOpen } = miscSlice.actions;
export default miscSlice;
