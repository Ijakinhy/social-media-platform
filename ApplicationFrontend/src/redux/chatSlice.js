import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isMessageModelOpen: false,
  isChatsOpen: false,
};

const chatsSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setIsMessageModelOpen: (state, action) => {
      state.isMessageModelOpen = action.payload;
    },
    setIsChatsOpen: (state, action) => {
      state.isChatsOpen = action.payload;
    },
  },
});

export const { setIsMessageModelOpen, setIsChatsOpen } = chatsSlice.actions;

export default chatsSlice.reducer;
