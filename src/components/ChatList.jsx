import React, { useState } from "react";
import ChatItem from "./ChatItem";
import "../styles/ChatList.css";
import * as FaIcons from "react-icons/fa";
import AddFriendModal from './AddFriendModal'; // Import Modal
import SearchBar from "./SearchBar"; // Import SearchBar

const ChatList = ({ onSelectChat }) => {
  const [selectedChatId, setSelectedChatId] = useState(1); // Mặc định chọn chat đầu tiên

  const chats = [
    {
      id: 1,
      name: "PTCNM",
      message: "Xin chào!",
      time: "16 phút",
      unreadCount: 1,
      avatar: "", // Placeholder
      thoigiantruycap: "5 phút",
      trangthai: "online",
      messages: [
        { id: 1, sender: "PTCNM", content: "Xin chào!", time: "10:00", type: "received" },
      ],
    },
    {
      id: 2,
      name: "Văn A",
      message: "Xin chào!",
      time: "16 phút",
      unreadCount: 0,
      avatar: "",
      thoigiantruycap: "5 phút",
      trangthai: "offline",
      messages: [
        { id: 1, sender: "Văn A", content: "Xin chào!", time: "10:00", type: "received" },
      ],
    },
    {
      id: 3,
      name: "Cloud của tôi",
      message: "Chưa có tin nhắn",
      time: "",
      unreadCount: 0,
      avatar: "",
      thoigiantruycap: "",
      trangthai: "offline",
      messages: [],
    },
  ];

  const handleSelectChat = (chat) => {
    setSelectedChatId(chat.id);
    onSelectChat(chat);
  };

  return (
    <div className="chat-list">
      <SearchBar />
      <div className="tab-menu">
        <span className="active-tab">Tất cả</span>
        <span>Chưa đọc</span>
        <span>Phân loại</span>
        <button className="btn-icon">
          <FaIcons.FaAngleDown />
        </button>
        <button className="btn-icon">
          <FaIcons.FaEllipsisH />
        </button>
      </div>
      <div className="chat-items">
        {chats.map((chat) => (
          <ChatItem
            key={chat.id}
            chat={chat}
            onSelectChat={handleSelectChat}
            isSelected={chat.id === selectedChatId}
          />
        ))}
      </div>
    </div>
  );
};

export default ChatList;