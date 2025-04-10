import React from "react";

const GroupList = () => {
  return (
    <div className="content-section">
      <h3>Danh sách nhóm</h3>
      {/* Hiển thị danh sách nhóm ở đây */}
      <div className="group-item">
        <span>Nhóm Zalo Developer</span>
      </div>
      <div className="group-item">
        <span>Nhóm Học lập trình</span>
      </div>
      {/* Bạn có thể thêm nhiều nhóm ở đây */}
    </div>
  );
};

export default GroupList;
