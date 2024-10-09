import { createSlice } from "@reduxjs/toolkit";

interface User {
  _id: string;
  name: string;
  userName: string;
  profilePic?: {
    public_id: string;
    url: string;
  };
  createdAt: string;
  updatedAt: string;
}
interface AuthState {
  userAuth: User | null;
  loading: boolean;
}
const initialState: AuthState = {
  userAuth: null,
  loading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action) {
      state.userAuth = action.payload;
      state.loading = false;
    },
    clearUser(state) {
      state.userAuth = null;
      state.loading = false;
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice;
