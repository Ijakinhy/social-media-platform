import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isMessageModelOpen: false,
  isChatsOpen: false,
  chatId: null,
  chat: {},
  user: {},
  messages: [],
  unreadChatsCount: 0,
  isNewChat: false,
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
      const { chatId, user, currentUser, chat } = action.payload;

      // Handle cases where blocked array might be undefined
      const userBlocked = user?.blocked || [];
      const currentUserBlocked = currentUser?.blocked || [];

      if (userBlocked.includes(currentUser.userId)) {
        return { ...state, isCurrentUserBlocked: true, chatId, messages: [] };
      } else if (currentUserBlocked.includes(user.userId)) {
        return {
          ...state,
          isReceiverBlocked: true,
          chatId: chatId,
          user: user,
          chat,
          messages: [],
        };
      } else {
        return {
          ...state,
          chatId,
          user: user,
          chat,
          isCurrentUserBlocked: false,
          isReceiverBlocked: false,
          messages: [],
        };
      }
    },
    blockUser: (state) => {
      return { ...state, isReceiverBlocked: !state.isReceiverBlocked };
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      // Avoid duplicates
      const exists = state.messages.some(
        (m) => m.messageId === action.payload.messageId
      );
      if (!exists) {
        state.messages.push(action.payload);
      }
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    setUnreadChatsCount: (state, action) => {
      state.unreadChatsCount = action.payload;
    },
    startNewChat: (state, action) => {
      const { user } = action.payload;
      return {
        ...state,
        chatId: null,
        user: user,
        chat: {},
        isNewChat: true,
        messages: [],
        isCurrentUserBlocked: false,
        isReceiverBlocked: false,
      };
    },
    setChatId: (state, action) => {
      state.chatId = action.payload;
      state.isNewChat = false;
    },
    setIsNewChat: (state, action) => {
      state.isNewChat = action.payload;
    },
  },
});

export const {
  setIsMessageModelOpen,
  setIsChatsOpen,
  changeChat,
  blockUser,
  setMessages,
  addMessage,
  clearMessages,
  setUnreadChatsCount,
  startNewChat,
  setChatId,
  setIsNewChat,
} = chatsSlice.actions;

export default chatsSlice.reducer;
