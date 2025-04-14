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

const ChatList = ({ onSelectChat,user }) => {
  const [Messages, setMessages] = useState([]);

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
  useEffect(() => {
    if (!socket || !user?.userID) return;
  
    const handleConnect = () => {
      console.log("✅ Socket connected:", socket.id);
  
      // Emit sau khi kết nối socket
      socket.emit("join_user", user.userID);
      socket.emit("getChat", user.userID);
    };
  
    // Nếu đã connected => emit luôn, chưa thì đợi sự kiện "connect"
    if (socket.connected) {
      handleConnect();
    } else {
      socket.on("connect", handleConnect);
    }
  
    const handleChatByUserID = (data) => {
      const sortedChats = data.sort((a, b) => {
        const aTime = a.lastMessage?.[0]?.timestamp || 0;
        const bTime = b.lastMessage?.[0]?.timestamp || 0;
        return new Date(bTime) - new Date(aTime);
      });
      setMessages(sortedChats);
    };
  
    const handleNewMessage = (newMsg) => {
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        const chatIndex = updatedMessages.findIndex(c => c.chatID === newMsg.chatID);
  
        if (chatIndex !== -1) {
          const chat = updatedMessages[chatIndex];
          chat.lastMessage = [
            { ...newMsg, senderInfo: newMsg.senderInfo || {} },
            ...(chat.lastMessage || []),
          ];
          chat.unreadCount = (chat.unreadCount || 0) + 1;
        } else {
          updatedMessages.unshift({
            chatID: newMsg.chatID,
            name: newMsg.senderInfo?.name || 'Tin nhắn mới',
            unreadCount: 1,
            lastMessage: [{ ...newMsg, senderInfo: newMsg.senderInfo || {} }],
          });
        }
  
        return updatedMessages.sort((a, b) => {
          const aTime = a.lastMessage?.[0]?.timestamp || 0;
          const bTime = b.lastMessage?.[0]?.timestamp || 0;
          return new Date(bTime) - new Date(aTime);
        });
      });
    };
  
    const handleStatusUpdate = ({ chatID, userID, status }) => {
      if (status === "read" && userID === user.userID) {
        setMessages((prevMessages) =>
          prevMessages.map(chat =>
            chat.chatID === chatID ? { ...chat, unreadCount: 0 } : chat
          )
        );
      }
    };
  
    const handleNewChat1to1 = (data) => {
      if (!data || !data.data) return;
      const newChat = data.data;
  
      setMessages((prevMessages) => {
        const exists = prevMessages.some(chat => chat.chatID === newChat.chatID);
        if (exists) return prevMessages;
        return [newChat, ...prevMessages];
      });
    };
  
    // Đăng ký socket listeners
    socket.on("ChatByUserID", handleChatByUserID);
    socket.on("new_message", handleNewMessage);
    socket.on("status_update_all", handleStatusUpdate);
    socket.on("newChat1-1", handleNewChat1to1);
  
    // Cleanup
    return () => {
      socket.off("connect", handleConnect);
      socket.off("ChatByUserID", handleChatByUserID);
      socket.off("new_message", handleNewMessage);
      socket.off("status_update_all", handleStatusUpdate);
      socket.off("newChat1-1", handleNewChat1to1);
    };
  }, [socket, user?.userID]);
  
  
  
  const [selectedChatId, setSelectedChatId] = useState(Messages[0]?.chatID || null); 


  const handleSelectChat = (chat) => {
    setSelectedChatId(chat.chatID);
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