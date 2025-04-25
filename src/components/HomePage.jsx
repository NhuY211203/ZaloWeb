import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import Friend from "./Friend";
import "../styles/HomePage.css";
import { useLocation } from "react-router-dom";
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const HomePage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
 // const [Messagess, setMessages] = useState([]); // đổi tên Messagess → messages
  const [view, setView] = useState("chat");

  const location = useLocation();
  const user = location.state?.user;

  // useEffect(() => {
  //   if (!socket || !user?.userID) return;

  //   const handleConnect = () => {
  //     console.log("✅ Socket connected:", socket.id);
  //     socket.emit("join_user", user.userID);
  //     socket.emit("getChat", user.userID);
  //   };

  //   if (socket.connected) {
  //     handleConnect();
  //   } else {
  //     socket.on("connect", handleConnect);
  //   }

  //   const handleChatByUserID = (data) => {
  //     const sortedChats = data.sort((a, b) => {
  //       const aTime = a.lastMessage?.[0]?.timestamp || 0;
  //       const bTime = b.lastMessage?.[0]?.timestamp || 0;
  //       return new Date(bTime) - new Date(aTime);
  //     });
  //     setMessages(sortedChats);
  //   };

  //   const handleUpdateChat = (data) => {
  //     console.log("📦 Update chat:", data);
  //     setMessages((prev) => {
  //       const index = prev.findIndex(chat => chat.chatID === data.chatID);
  //       if (index !== -1) {
  //         const updated = [...prev];
  //         updated[index] = { ...updated[index], ...data };
  //         return updated;
  //       }
  //       return [...prev, data];
  //     });
  //   };

  //   socket.on("ChatByUserID", handleChatByUserID);
  //   socket.on("updateMemberChat", handleUpdateChat);
  //   socket.on("removeChat", (chatID) => {
  //     console.log("📦 Remove chat:", chatID);
  //     setMessages(prev => prev.filter(chat => chat.chatID !== chatID));
  //   });

  //   return () => {
  //     socket.off("connect", handleConnect);
  //     socket.off("ChatByUserID", handleChatByUserID);
  //     socket.off("updateMemberChat", handleUpdateChat);
  //     socket.off("removeChat");
  //   };
  // }, [user,socket]);

  // useEffect(() => {
  //   if (!socket || !user?.userID) return;

  //   const handleConnect = () => {
  //     console.log("✅ Socket connected:", socket.id);
  //     socket.emit("join_user", user.userID);
  //     socket.emit("getChat", user.userID);
  //   };

  //   if (socket.connected) {
  //     handleConnect();
  //   } else {
  //     socket.on("connect", handleConnect);
  //   }

  //   const handleChatByUserID = (data) => {
  //     const sortedChats = data.sort((a, b) => {
  //       const aTime = a.lastMessage?.[0]?.timestamp || 0;
  //       const bTime = b.lastMessage?.[0]?.timestamp || 0;
  //       return new Date(bTime) - new Date(aTime);
  //     });
  //     setMessages(sortedChats);
  //   };

  //   socket.on("ChatByUserID", handleChatByUserID);

  //   return () => {
  //     socket.off("connect", handleConnect);
  //     socket.off("ChatByUserID", handleChatByUserID);
  //   };
  // }, [user]);

  const handleUpdateMessages = (newData, type = 'update') => {
    if (type === 'remove') {
      setMessages((prev) => prev.filter(chat => chat.chatID !== newData));
    } else {
      setMessages((prev) => {
        const updatedMessages = [...prev];
        const chatIndex = updatedMessages.findIndex(c => c.chatID === newData.chatID);

        if (chatIndex !== -1) {
          updatedMessages[chatIndex] = { ...updatedMessages[chatIndex], ...newData };
        } else {
          updatedMessages.unshift(newData);
        }
        return updatedMessages.sort((a, b) => {
          const aTime = a.lastMessage?.[0]?.timestamp || 0;
          const bTime = b.lastMessage?.[0]?.timestamp || 0;
          return new Date(bTime) - new Date(aTime);
        });
      });
    }
  };

 // console.log("📦 messages:", Messagess);

  const handleViewChange = (newView) => {
    setView(newView);
  };

  return (
    <div className="main">
      <Sidebar user={user} onChangeView={handleViewChange} />
      <div className="chat-container">
        {view === "chat" ? (
          <>
            <ChatList
              user={user}
              onSelectChat={setSelectedChat}
              onStartChat={(chat) => {
                setSelectedChat(chat);
                setView("chat");
              }}
             // Messagess={Messagess}
             // onUpdateMessages={handleUpdateMessages}
             onLeaveGroupSuccess={() => {
              setSelectedChat(null);
              setView("chat");
            }}
            />
            <ChatWindow
              selectedChat={selectedChat}
              user={user}
              onLeaveGroupSuccess={() => {
                setSelectedChat(null);
                setView("chat");
              }}
            />
          </>
        ) : (
          <Friend
            user={user}
            onStartChat={(chat) => {
              setSelectedChat(chat);
              setView("chat");
            }}
          />
        )}
      </div>
    </div>
  );
};

export default HomePage;
