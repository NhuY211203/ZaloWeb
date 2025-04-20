import React, { useState, useEffect } from "react"; 
import { FaTimes } from "react-icons/fa"; 
import axios from "axios";
import "../styles/GroupMembersModal.css"; // Import CSS for modal

const LeaveGroupModal = ({
  isOpen,
  handleClose,
  selectedChat,
  handleLeaveGroup,
  user,
}) => {
  const [newAdmin, setNewAdmin] = useState(null); // State to store the selected new admin

  // Lọc các thành viên trừ admin
  const membersExcludingAdmin = selectedChat.members.filter(
    (member) => member.role !== "admin"
  );

  // Hàm xử lý khi người dùng chọn một thành viên làm admin mới
  const handleAdminSelect = (userID) => {
    setNewAdmin(userID); // Cập nhật người admin mới khi chọn
  };

  // Hàm xác nhận khi người dùng rời nhóm
  const handleConfirmLeave = () => {
    if (newAdmin) {
      handleLeaveGroup(newAdmin); // Rời nhóm và chuyển quyền admin
    } else {
      alert("Vui lòng chọn một thành viên làm admin mới.");
    }
  };

  if (!isOpen) return null; // Không render khi modal không mở

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Chuyển quyền Admin và rời nhóm</h2>
          <button onClick={handleClose}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <p>Chọn người làm Admin mới trước khi bạn rời nhóm:</p>
          <div className="member-list">
            {membersExcludingAdmin.map((member) => (
              <div 
                key={member.userID} 
                className="member-item" 
                onClick={() => handleAdminSelect(member.userID)}
                style={{
                  cursor: 'pointer', 
                  padding: '10px', 
                  border: '1px solid #ccc', 
                  marginBottom: '10px', 
                  display: 'flex', 
                  alignItems: 'center',
                  backgroundColor: newAdmin === member.userID ? '#d3d3d3' : 'transparent'
                }}
              >
                <img 
                  src={member.avatar} 
                  alt={member.name} 
                  className="avatar-small" 
                  style={{ marginRight: '10px', width: '30px', height: '30px', borderRadius: '50%' }} 
                />
                <span>{member.name}</span>
              </div>
            ))}
          </div>
          <button onClick={handleConfirmLeave}>Rời nhóm</button>
        </div>
      </div>
    </div>
  );
};

export default LeaveGroupModal;
