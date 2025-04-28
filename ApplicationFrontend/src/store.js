import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./redux/userSlice";
import chatsSlice from "./redux/chatSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    chats: chatsSlice,
  },
});
