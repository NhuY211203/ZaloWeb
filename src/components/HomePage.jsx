import React, { useState } from "react";
import Sidebar from "./Sidebar";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import "../styles/HomePage.css";

const HomePage = () => {
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div className="main">
      <Sidebar />
      <div className="chat-container">
        <ChatList onSelectChat={setSelectedChat} />
        <ChatWindow selectedChat={selectedChat} />
      </div>
    </div>
  );
};

export default HomePage;
