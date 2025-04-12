import React from "react";
import "../styles/ChatItem.css";

const ChatItem = ({ chat, onSelectChat, isSelected,user }) => {
  return (
    <div
      className={`chat-item ${isSelected ? "selected" : ""}`}
      onClick={() => onSelectChat(chat)}
      style={{ cursor: "pointer" }}
    >
      <div >
      { chat.lastMessage?.find((msg) => msg.senderID !== user.userID) && (
              <img
                key={chat.lastMessage.find(msg => msg.senderID !== user.userID)?._id}
                src={chat.lastMessage.find(msg => msg.senderID !== user.userID)?.senderInfo?.avatar}
                alt="avatar"
                className="avatar"
              />
            )}
      </div>
      <div className="chat-info">
        <p className="chat-name">{chat.name}</p>
        <p className="chat-message">{chat.message}</p>
      </div>
      <div className="chat-meta">
        <span className="chat-time">{chat.time}</span>
        {chat.unreadCount > 0 && (
          <span className="unread-count">{chat.unreadCount}</span>
        )}
      </div>
    </div>
  );
};

export default ChatItem;