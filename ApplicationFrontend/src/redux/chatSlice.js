import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isMessageModelOpen: false,
  isChatsOpen: false,
  chatId: null,
  chat:{},
  user: {},
  isCurrentUserBlocked: false,
  isReceiverBlocked: false, 
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
       changeChat: (state, action) => {
      const { chatId, user, currentUser,chat } = action.payload;
      
      if (user.blocked.includes(currentUser.userId)) {
        return { ...state, isCurrentUserBlocked: true, chatId };
      } else if (currentUser.blocked.includes(user.userId)) {
        return {
          ...state,
          isCurrentUserBlocked: true,
          chatId: chatId,
          user: user,
          chat
        };
      } else {
        return { ...state, chatId, user: user,chat };
      }
    },
     blockUser: (state) => {
      return { ...state, isReceiverBlocked: !state.isReceiverBlocked };
    }
  },
});

export const { setIsMessageModelOpen, setIsChatsOpen,changeChat } = chatsSlice.actions;

export default chatsSlice.reducer;
