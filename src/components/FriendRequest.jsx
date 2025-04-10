import React from "react";

const FriendRequest = () => {
  return (
    <div className="content-section">
      <h3>Lời mời kết bạn</h3>
      {/* Hiển thị lời mời kết bạn ở đây */}
      <div className="request-item">
        <span>Văn A mời kết bạn</span>
        <button className="btn-accept">Chấp nhận</button>
        <button className="btn-decline">Từ chối</button>
      </div>
      <div className="request-item">
        <span>Anh B mời kết bạn</span>
        <button className="btn-accept">Chấp nhận</button>
        <button className="btn-decline">Từ chối</button>
      </div>
      {/* Bạn có thể thêm nhiều lời mời kết bạn ở đây */}
    </div>
  );
};

export default FriendRequest;
