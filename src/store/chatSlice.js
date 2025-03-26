import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  chats: [
    { id: 1, name: "Nguyễn Văn A", lastMessage: "Xin chào!", messages: [] },
    { id: 2, name: "Trần Thị B", lastMessage: "Hẹn gặp lại!", messages: [] }
  ],
  selectedChat: null, // Cuộc trò chuyện đang chọn
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    selectChat: (state, action) => {
      state.selectedChat = state.chats.find(chat => chat.id === action.payload);
    },
    sendMessage: (state, action) => {
      const { chatId, message } = action.payload;
      const chat = state.chats.find(chat => chat.id === chatId);
      if (chat) {
        chat.messages.push({ sender: "me", text: message });
        chat.lastMessage = message;
      }
    }
  }
});

export const { selectChat, sendMessage } = chatSlice.actions;
export default chatSlice.reducer;
