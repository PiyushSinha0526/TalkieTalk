import { configureStore } from "@reduxjs/toolkit";
import userApi from "./api/userApi";
import authSlice from "./slices/authSlice";
import authApi from "./api/authApi";
import chatSlice from "./slices/chatSlice";
import miscSlice from "./slices/miscSlice";
import chatApi from "./api/chatApi";

export const store = configureStore({
  reducer: {
    // api(s)
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,

    // slices
    [authSlice.name]: authSlice.reducer,
    [chatSlice.name]: chatSlice.reducer,
    [miscSlice.name]: miscSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      userApi.middleware,
      chatApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
