
import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import axios from "axios";
import "../styles/GroupMembersModal.css"; // Import CSS for modal
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const GroupMembersModal = ({
  isOpen,
  handleClose,
  selectedChat, // groupInfo directly containing members
  userRole,
  user,
  members
}) => {
  const [membersInfo, setMembersInfo] = useState([]); // State to store members info
  const [loading, setLoading] = useState(false); // Loading state
  const [friendsFromServer, setFriendsFromServer] = useState(members||[]); // State to store friends from server

  

  // Use groupInfo directly for members data
  useEffect(() => {
    if (isOpen && selectedChat.members) {
      setFriendsFromServer(members); // Use members directly from props
      setLoading(true);
      setMembersInfo(selectedChat.members); // Directly use groupInfo.members
      setLoading(false);
    }
  }, [isOpen, selectedChat.members]); // Re-run when modal opens and members change
  // useEffect(() => {
  //   if (!user) return;    
  //   socket.emit('join_user', user.userID);
  //   socket.on("newMember", (data) => {
  //     console.log("📦 newMember:", data);
  //     setFriendsFromServer(data);
  //   });
  //   return () => {
  //     socket.off("newMember"); // Dọn dẹp sự kiện khi component unmount
  //   }
  // }, [user, socket]);
  console.log("📦 friendsFromServer:", friendsFromServer);

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
          ) : friendsFromServer.length === 0 ? (
            <p>Không có thành viên nào trong nhóm.</p>
          ) : (
            friendsFromServer.map((member) => (
              <div key={member.userID} className="member-item">
                <img src={member.avatar} alt="avatar" className="avatar-small" />
                <span>{member.name}</span>
                <span className="role-label">
                  {/* Hiển thị Admin nếu là admin, nếu không thì là thành viên */}
                  {member.userID === selectedChat.members ? "Admin" : "Thành viên"}
                </span>
                {/* {userRole === "admin" && member.userID !== user.userID && (
                  <div>
                    <button
                      className="remove-member-btn"
onClick={() => handleRemoveMember(member.userID)}
                    >
                      Xóa
                    </button>
                  </div>
                )} */}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupMembersModal;
