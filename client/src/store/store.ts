import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice";
import authApi from "./api/authApi";
import chatSlice from "./slices/chatSlice";
import chatApi from "./api/chatApi";

export const store = configureStore({
  reducer: {
    // api(s)
    [authApi.reducerPath]: authApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,

    // slices
    [authSlice.name]: authSlice.reducer,
    [chatSlice.name]: chatSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, chatApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
