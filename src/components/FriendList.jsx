import React from "react";
import "../styles/FriendList.css"; // Import CSS
import { FaUserFriends } from "react-icons/fa"; // Import icon từ react-icons

const FriendList = () => {
  return (
    <div className="content-section">
      <h3>
        <FaUserFriends className="icon" />
        Danh sách bạn bè
      </h3>
      <div>
        <span className="friend-count">Số lượng bạn bè: 10</span>
      </div>

      {/* Danh sách bạn bè */}
      <div className="friend-item">
        <span>Văn A</span>
      </div>
      <div className="friend-item">
        <span>Anh B</span>
      </div>
      <div className="friend-item">
        <span>Ngọc C</span>
      </div>
      {/* Bạn có thể thêm nhiều bạn bè ở đây */}
    </div>
  );
};

export default FriendList;
