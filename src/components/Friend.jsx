import React, { useState } from "react";
import "../styles/Friend.css"; // Import CSS cho modal
import { FaUserFriends, FaUsers, FaUserPlus } from "react-icons/fa"; // Import icon từ react-icons
import SearchBar from "../components/SearchBar";
import FriendList from "./FriendList";
import GroupList from "./GroupList";
import FriendRequest from "./FriendRequest";

const Friend = ({ user }) => {
  // Trạng thái để quản lý view hiện tại
  const [activeView, setActiveView] = useState("friends");

  // Hàm xử lý khi nhấn vào từng button
  const handleViewChange = (view) => {
    setActiveView(view); // Cập nhật view khi nhấn vào nút
  };

  return (
    <div className="profile-container">
      <div className="button-group">
      <SearchBar />
        <button
          className={`btn ${activeView === "friends" ? "active" : ""}`}
          onClick={() => handleViewChange("friends")}
        >
          <FaUserFriends className="icon" />
          Danh sách bạn bè
        </button>

        <button
          className={`btn ${activeView === "groups" ? "active" : ""}`}
          onClick={() => handleViewChange("groups")}
        >
          <FaUsers className="icon" />
          Danh sách nhóm
        </button>

        <button
          className={`btn ${activeView === "invites" ? "active" : ""}`}
          onClick={() => handleViewChange("invites")}
        >
          <FaUserPlus className="icon" />
          Lời mời kết bạn
        </button>
      </div>

      {/* Nội dung hiển thị bên cạnh */}
      <div className="content-container">
        {activeView === "friends" && <FriendList />}
        {activeView === "groups" && <GroupList />}
        {activeView === "invites" && <FriendRequest />}
      </div>
    </div>
  );
};

export default Friend;
