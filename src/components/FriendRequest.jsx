import React from "react";
import "../styles/FriendRequest.css"; // Import CSS
import { FaUserFriends } from "react-icons/fa"; // Import icon từ react-icons

const FriendRequest = () => {
  return (
    <div className="friend-request-container">
      <h3>
        <FaUserFriends className="icon" />
        Lời mời kết bạn
      </h3>
      <div>
        <span className="friend-count">Lời mời đã nhận: 10</span>
      </div>
      <div className="friend-item">
        <img src="https://example.com/avatar.jpg" alt="Avatar" />
        <div className="info">
          <h4>Nhà Thuốc Ánh Dương</h4>
          <p>Xin chào, mình là Nhà Thuốc Ánh Dương. Mình tìm thấy bạn bằng số điện thoại.</p>
        </div>
        <div className="btn-group">
          <button className="accept-btn">Đồng ý</button>
          <button className="reject-btn">Từ chối</button>
        </div>
      </div>
      <div className="friend-item">
        <img src="https://example.com/avatar2.jpg" alt="Avatar" />
        <div className="info">
          <h4>Văn A</h4>
          <p>Xin chào, tôi là Văn A. Kết bạn với tôi nhé!</p>
        </div>
        <div className="btn-group">
          <button className="accept-btn">Đồng ý</button>
          <button className="reject-btn">Từ chối</button>
        </div>
      </div>
      {/* Bạn có thể thêm nhiều lời mời kết bạn ở đây */}
    </div>
  );
};

export default FriendRequest;
