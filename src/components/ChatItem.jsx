import React from "react";
import "../styles/ChatItem.css";

const ChatItem = ({ chat, onSelectChat }) => {
  return (
    <div className="chat-item" onClick={() => onSelectChat(chat)} style={{ cursor: "pointer" }}>
      <div className="avatar"></div>
      <div className="chat-info">
        <p className="chat-name">{chat.name}</p>
        <p className="chat-message">{chat.message}</p>
      </div>
      <span className="chat-time">{chat.time}</span>
    </div>
  );
};

export default ChatItem;
