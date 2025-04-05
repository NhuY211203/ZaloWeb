import React, { useState } from "react";
import Sidebar from "./Sidebar";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import "../styles/HomePage.css";
import { useLocation } from "react-router-dom";


const HomePage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const location = useLocation();
  const user = location.state?.user; // Dữ liệu user từ trang đăng nhập

  return (
    <div className="main">
      <Sidebar user={user} />
      <div className="chat-container">
        <ChatList onSelectChat={setSelectedChat} />
        <ChatWindow selectedChat={selectedChat} />
      </div>
    </div>
  );
};

export default HomePage;