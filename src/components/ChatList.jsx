import React, { useState,useEffect } from "react";
import ChatItem from "./ChatItem";
import "../styles/ChatList.css";
import * as FaIcons from "react-icons/fa";
import AddFriendModal from './AddFriendModal'; // Import Modal
import SearchBar from "./SearchBar"; // Import SearchBar
import { io } from 'socket.io-client';

//const socket = io('https://cnm-service.onrender.com');
//const socket = io('http://192.168.1.20:5000');
const socket = io('http://localhost:5000');

const ChatList = ({ onSelectChat,user , onStartChat,onLeaveGroupSuccess}) => {
  const [Messages, setMessages] = useState([]);

  
 useEffect(() => {
  if (!socket || !user?.userID) return;

  const handleConnect = () => {
    console.log("✅ Socket connected:", socket.id);
    socket.emit("join_user", user.userID);
    socket.emit("getChat", user.userID);
  };

  // Kết nối socket
  socket.connected ? handleConnect() : socket.on("connect", handleConnect);

  const handleChatByUserID = (data) => {
    const sortedChats = data.sort((a, b) => {
      const aTime = a.lastMessage?.[0]?.timestamp || 0;
      const bTime = b.lastMessage?.[0]?.timestamp || 0;
      return new Date(bTime) - new Date(aTime);
    });
    setMessages(sortedChats);
  };

  const handleNewMessage = (newMsg) => {
    setMessages((prev) => {
      const updated = [...prev];
      const chatIndex = updated.findIndex(c => c.chatID === newMsg.chatID);

      if (chatIndex !== -1) {
        const chat = updated[chatIndex];
        const oldMessages = chat.lastMessage || [];
        const msgIndex = oldMessages.findIndex(
          m => m.messageID === newMsg.messageID || m.tempID === newMsg.tempID
        );

        if (msgIndex !== -1) {
          oldMessages[msgIndex] = { ...oldMessages[msgIndex], ...newMsg };
        } else {
          oldMessages.unshift({ ...newMsg, senderInfo: newMsg.senderInfo || {} });
          chat.unreadCount = (chat.unreadCount || 0) + 1;
        }

        chat.lastMessage = oldMessages;
      } else {
        updated.unshift({
          chatID: newMsg.chatID,
          name: newMsg.senderInfo?.name || "Tin nhắn mới",
          unreadCount: 1,
          lastMessage: [{ ...newMsg, senderInfo: newMsg.senderInfo || {} }],
        });
      }

      return updated.sort((a, b) =>
        new Date(b.lastMessage?.[0]?.timestamp || 0) - new Date(a.lastMessage?.[0]?.timestamp || 0)
      );
    });
  };

  const handleStatusUpdate = ({ chatID, userID, status }) => {
    if (status === "read" && userID === user.userID) {
      setMessages((prev) =>
        prev.map(chat =>
          chat.chatID === chatID ? { ...chat, unreadCount: 0 } : chat
        )
      );
    }
  };

  const handleUpdateChat = (data) => {
    setMessages((prev) => {
      const index = prev.findIndex(chat => chat.chatID === data.chatID);
      if (index !== -1) {
        const updated = [...prev];
        updated[index] = { ...updated[index], ...data };
        return updated;
      }
      return [...prev, data];
    });
  };

  const handleNewChat1to1 = (newChat) => {
    console.log("newChat", newChat);
    setMessages((prev) => [...prev, newChat]);
  };

  const handleRemoveChat = (chatID) => {
    console.log("❌ Chat removed:", chatID);
    setMessages((prev) => prev.filter(chat => chat.chatID !== chatID));
    onLeaveGroupSuccess?.();
  };

  // Đăng ký sự kiện
  socket.on("ChatByUserID", handleChatByUserID);
  socket.on("new_message", handleNewMessage);
  socket.on("status_update_all", handleStatusUpdate);
  socket.on("newChat1-1", handleNewChat1to1);
  socket.on("unsend_notification", handleNewMessage);

  const updateChatEvents = [
    "updateChat",
    "updateMemberChat",
    "updateMemberChattt",
    "updateChatt",
    "updateChatmember"
  ];
  updateChatEvents.forEach(evt => socket.on(evt, handleUpdateChat));

  const removeChatEvents = ["removeChat", "removeChatt", "removeChattt"];
  removeChatEvents.forEach(evt => socket.on(evt, handleRemoveChat));

  // Cleanup
  return () => {
    socket.off("connect", handleConnect);
    socket.off("ChatByUserID", handleChatByUserID);
    socket.off("new_message", handleNewMessage);
    socket.off("status_update_all", handleStatusUpdate);
    socket.off("newChat1-1", handleNewChat1to1);
    socket.off("unsend_notification", handleNewMessage);

    updateChatEvents.forEach(evt => socket.off(evt, handleUpdateChat));
    removeChatEvents.forEach(evt => socket.off(evt, handleRemoveChat));
  };
}, [socket, user?.userID]);
// useEffect(() => {
//   if (!socket || !user?.userID) return;

//   const handleConnect = () => {
//     console.log("✅ Socket connected:", socket.id);
//     socket.emit("join_user", user.userID); // Quan trọng
//     socket.emit("getChat", user.userID);
//   };

//   if (socket.connected) handleConnect();
//   else socket.on("connect", handleConnect);
//     const handleChatByUserID = (data) => {
//     const sortedChats = data.sort((a, b) => {
//       const aTime = a.lastMessage?.[0]?.timestamp || 0;
//       const bTime = b.lastMessage?.[0]?.timestamp || 0;
//       return new Date(bTime) - new Date(aTime);
//     });
//     setMessages(sortedChats);
//   };
//   // Xử lý tin nhắn mới
//   const handleNewMessage = (newMsg) => {
//     console.log("📥 New message received:", newMsg);
  
//     setMessages((prevMessages) => {
//       const updated = [...prevMessages];
//       const chatIndex = updated.findIndex(c => c.chatID === newMsg.chatID);

//       if (chatIndex !== -1) {
//         const chat = updated[chatIndex];
//         const oldMessages = chat.lastMessage || [];
//         const exists = oldMessages.find(m => m.messageID === newMsg.messageID);

//         if (!exists) {
//           oldMessages.unshift(newMsg);
//           chat.unreadCount = (chat.unreadCount || 0) + 1;
//         }

//         chat.lastMessage = oldMessages;
//       } else {
//         updated.unshift({
//           chatID: newMsg.chatID,
//           name: newMsg.senderInfo?.name || "Tin nhắn mới",
//           unreadCount: 1,
//           lastMessage: [newMsg],
//         });
//       }

//       return updated.sort((a, b) => {
//         const aTime = new Date(a.lastMessage?.[0]?.timestamp || 0);
//         const bTime = new Date(b.lastMessage?.[0]?.timestamp || 0);
//         return bTime - aTime;
//       });
//     });
//   };

//   socket.on("new_message", handleNewMessage);
//   socket.on("ChatByUserID", handleChatByUserID);
  

//   return () => {
//     socket.off("connect", handleConnect);
//     socket.off("new_message", handleNewMessage);
//     socket.off("ChatByUserID", handleChatByUserID);
//   };
// }, [socket, user?.userID]);


  
  
  const [selectedChatId, setSelectedChatId] = useState(Messages[0]?.chatID || null); 


  const handleSelectChat = (chat) => {
    setSelectedChatId(chat.chatID);
    onSelectChat(chat);
  };

  return (
    <div className="chat-list">
      <SearchBar 
        user={user}
        onStartChat={onStartChat} // Truyền hàm onStartChat vào SearchBar
      />
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
        {Messages.map((chat) => (
          <ChatItem
            key={chat.chatID}
            chat={chat}
            onSelectChat={handleSelectChat}
            isSelected={chat.chatID === selectedChatId}
            user={user} // Truyền user vào đây nếu cần thiết
          />
        ))}
      </div>
    </div>
  );
};

export default ChatList;