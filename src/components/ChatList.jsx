import React from "react";
import "../styles/ChatList.css";
import * as FaIcons from "react-icons/fa";

const SearchBar = () => {
  return (
    <div className="search-bar">
      {/* Ô tìm kiếm */}
      <div className="search-box">
        <span className="search-icon"><FaIcons.FaSearch /></span>
        <input
          type="text"
          className="search-input"
          placeholder="Tìm kiếm"
        />
      </div>

      {/* Icon bên phải */}
      <div className="search-icons">
        <span className="add-friend-icon"><FaIcons.FaUserPlus /></span>
        <span className="add-group-icon"><FaIcons.FaUsers /></span>
      </div>
    </div>
  );
};

const ChatList = ({ onSelectChat }) => {
  const chats = [
    { id: 1, name: "Người Dùng 1", message: "Xin chào!", time: "16 phút" , image: "../assets/logo.png", thoigiantruycap: "5 phút" },
    { id: 2, name: "Người Dùng 2", message: "Bạn khỏe không?", time: "10 phút", image: "../assets/logo.png", thoigiantruycap: "6 phút" },
    { id: 3, name: "Người Dùng 3", message: "Hẹn gặp bạn sau!", time: "5 phút", image: "../assets/logo.png", thoigiantruycap: "7 phút"}
  ];

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

      {/* Danh sách chat */}
      <div className="chat-items">
        {chats.map((chat) => (
          <div 
            key={chat.id} 
            className="chat-item" 
            onClick={() => onSelectChat(chat)} 
            style={{ cursor: "pointer" }}
          >
            <div className="avatar"></div>
            <div className="chat-info">
              <p className="chat-name">{chat.name}</p>
              <p className="chat-message">{chat.message}</p>
            </div>
            <span className="chat-time">{chat.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;
