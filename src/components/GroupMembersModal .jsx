import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import axios from "axios";
import "../styles/GroupMembersModal.css"; // Import CSS for modal

const GroupMembersModal = ({
  isOpen,
  handleClose,
  selectedChat,  // Dùng selectedChat thay vì groupInfo
  userRole,
  handleRemoveMember,
  handleChangeRole,
  handleTransferRole,
  user,
}) => {
  const [membersInfo, setMembersInfo] = useState([]); // State to store members info
  const [loading, setLoading] = useState(false); // Loading state

  useEffect(() => {
    if (isOpen && selectedChat?.members) {  // Dùng selectedChat.members thay vì groupInfo.members
      setLoading(true);
      // Gửi yêu cầu API để lấy thông tin thành viên
      axios
        .post("http://localhost:5000/api/InforMember", { members: selectedChat.members })
        .then((response) => {
          setMembersInfo(response.data); // Lưu thông tin thành viên vào state
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching members info:", error);
          setLoading(false);
        });
    }
  }, [isOpen, selectedChat?.members]); // Chạy lại khi modal mở và members thay đổi

  if (!isOpen) return null; // Không render khi modal không mở

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Thành viên nhóm</h2>
          <button onClick={handleClose}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          {loading ? (
            <p>Đang tải thông tin thành viên...</p>
          ) : membersInfo.length === 0 ? (
            <p>Không có thành viên nào trong nhóm.</p>
          ) : (
            membersInfo.map((member) => (
              <div key={member.userID} className="member-item">
                <img src={member.avatar} alt="avatar" className="avatar-small" />
                <span>{member.name}</span>
                <span className="role-label">
                  {member.userID === selectedChat.adminID ? "Admin" : "Thành viên"}
                </span>
                {userRole === "admin" && member.userID !== user.userID && (
                  <div>
                    <button className="remove-member-btn" onClick={() => handleRemoveMember(member.userID)}>
                      Xóa
                    </button>
                    <button
                      className="change-role-btn"
                      onClick={() =>
                        handleChangeRole(member.userID, member.role === "member" ? "admin" : "member")
                      }
                    >
                      {member.role === "member" ? "Chỉ định Admin" : "Hủy Admin"}
                    </button>
                    <button className="transfer-role-btn" onClick={() => handleTransferRole(member.userID)}>
                      Chuyển giao Admin
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupMembersModal;
