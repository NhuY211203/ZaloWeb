import React, { useState } from "react";
import Sidebar from "./Sidebar";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import Friend from "./Friend";  // Tạo component Profile nếu cần
import "../styles/HomePage.css";
import { useLocation } from "react-router-dom";

const HomePage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [view, setView] = useState("chat"); // Trạng thái để quản lý màn hình hiện tại
  const location = useLocation();
  const user = location.state?.user; // Dữ liệu user từ trang đăng nhập

  console.log("User from HomePage:", user); // Kiểm tra dữ liệu user

  // Hàm thay đổi view
  const handleViewChange = (newView) => {
    setView(newView); // Cập nhật view khi nhấn vào icon
  };

  return (
    <div className="main">
      <Sidebar user={user} onChangeView={handleViewChange} /> {/* Truyền hàm thay đổi view */}
      <div className="chat-container">

        <ChatList onSelectChat={setSelectedChat} user={user}/>
        <ChatWindow selectedChat={selectedChat} />

        {view === "chat" && (
          <>
            <ChatList onSelectChat={setSelectedChat} />
            <ChatWindow selectedChat={selectedChat} />
          </>
        )}
        {view === "friend" && 
            <Friend user={user} />} {/* Hiển thị Profile nếu view là profile */}
      </div>
    </div>
  );
};

export default HomePage;
