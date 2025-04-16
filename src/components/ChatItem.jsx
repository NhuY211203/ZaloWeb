import React, { useEffect, useState } from "react";
import "../styles/ChatItem.css";
import { io } from 'socket.io-client';

// Khởi tạo socket
//const socket = io('https://cnm-service.onrender.com');
const socket = io('http://localhost:5000');

const ChatItem = ({ chat, onSelectChat, isSelected, user }) => {
  const [lastMessage, setLastMessage] = useState(chat.lastMessage || []);
  const [messageTime, setMessageTime] = useState('');
  const [isRead, setIsRead] = useState(chat.isRead || false);

  // Lắng nghe socket để cập nhật tin nhắn và thời gian
  useEffect(() => {
    if (!chat.chatID) return;

    const handleNewMessage = (data) => {
      if (data.chatID === chat.chatID) {
        setLastMessage([data]);
        // Sử dụng hàm lấy thời gian bạn cung cấp
        setMessageTime(data.timestamp ? new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '');
        setIsRead(data.senderID === user.userID);
      }
    };

    const handleStatusUpdate = ({ messageID, status }) => {
      if (status === 'read' && chat?.chatID === messageID?.chatID) {
        setIsRead(true);
      }
    };

    socket.emit('join_chat', chat.chatID);
    socket.on(chat.chatID, handleNewMessage);
    socket.on(`status_update_${chat.chatID}`, handleStatusUpdate);

    // Khởi tạo thời gian từ lastMessage nếu có
    if (chat.lastMessage?.[0]?.timestamp) {
      setMessageTime(chat.lastMessage[0].timestamp ? new Date(chat.lastMessage[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '');
    }

    return () => {
      socket.off(chat.chatID, handleNewMessage);
      socket.off(`status_update_${chat.chatID}`, handleStatusUpdate);
    };
  }, [chat.chatID, user.userID, chat.lastMessage]);

  // Xử lý hiển thị nội dung tin nhắn cuối cùng
  const getMessageContent = () => {
    const lastMsg = lastMessage[0] || chat.lastMessage?.[0];
    if (!lastMsg) return "No messages yet";

    return lastMsg.type === 'image'
      ? '[Image]'
      : lastMsg.type === 'video'
      ? '[Video]'
      : lastMsg.type === 'audio'
      ? '[Audio]'
      : lastMsg.content;
  };

  return (
    <div
      className={`chat-item ${isSelected ? "selected" : ""}`}
      onClick={() => {
        onSelectChat(chat);
        socket.emit('read_messages', { chatID: chat.chatID, userID: user.userID });
        setIsRead(true);
      }}
      style={{ cursor: "pointer" }}
    >
      <div>
        {lastMessage?.find((msg) => msg.senderID !== user.userID) ? (
          <img
            key={lastMessage.find((msg) => msg.senderID !== user.userID)?._id}
            src={lastMessage.find((msg) => msg.senderID !== user.userID)?.senderInfo?.avatar}
            alt="avatar"
            className="avatar"
          />
        ) : (
          chat.lastMessage?.find((msg) => msg.senderID !== user.userID) && (
            <img
              key={chat.lastMessage.find((msg) => msg.senderID !== user.userID)?._id}
              src={chat.lastMessage.find((msg) => msg.senderID !== user.userID)?.senderInfo?.avatar}
              alt="avatar"
              className="avatar"
            />
          )
        )}
      </div>
      <div className="chat-info">
        <p className="chat-name">{chat.name}</p>
        <p className="chat-message">{getMessageContent()}</p>
      </div>
      <div className="chat-meta">
        <span className="chat-time">{messageTime}</span>
        {isRead && <span className="read-status">Đã xem</span>}
      </div>
    </div>
  );
};

export default ChatItem;
