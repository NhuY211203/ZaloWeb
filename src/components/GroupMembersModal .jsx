import React from "react";
import { FaUsers, FaTimes } from "react-icons/fa";

const GroupMembersModal = ({
  isOpen,
  handleClose,
  groupInfo,
  userRole,
  handleRemoveMember,
  handleChangeRole,
  handleTransferRole,
  user,
}) => {
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
          {groupInfo?.members?.map((member) => (
            <div key={member.userID} className="member-item">
              <img src={member.anhDaiDien} alt="avatar" className="avatar-small" />
              <span>{member.name}</span>
              <span className="role-label">
                {member.userID === groupInfo.adminID ? "Admin" : "Thành viên"}
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroupMembersModal;
