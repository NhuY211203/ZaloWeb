import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import Friend from "./Friend";
import "../styles/HomePage.css";
import { useLocation } from "react-router-dom";
import { io } from 'socket.io-client';

const socket = io('https://cnm-service.onrender.com');

const HomePage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
 // const [Messagess, setMessages] = useState([]); // đổi tên Messagess → messages
  const [view, setView] = useState("chat");
  const location = useLocation();
  const [user, setUser] = useState(() => {
  return JSON.parse(sessionStorage.getItem("user")) || null;
});



  useEffect(() => {
    if (!user) return;
    socket.emit("join_user", user.userID);
    socket.on("update_user", (data) => {
      console.log("User updated:", data);
      setUser(data);
    });
   return () => {
      socket.off("update_user");
    }
  },[user]);

 

  const handleViewChange = (newView) => {
    setView(newView);
  };

  return (
    <div className="main">
      <Sidebar user={user} onChangeView={handleViewChange} setUser={setUser}/>
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
