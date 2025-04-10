import React from "react";

const FriendList = () => {
  return (
    <div className="content-section">
      <h3>Danh sách bạn bè</h3>
      {/* Hiển thị danh sách bạn bè ở đây */}
      <div className="friend-item">
        <span>Văn A</span>
      </div>
      <div className="friend-item">
        <span>Anh B</span>
      </div>
      {/* Bạn có thể thêm nhiều bạn bè ở đây */}
    </div>
  );
};

export default FriendList;
