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
  const [friendsFromServer, setFriendsFromServer] = useState([]); // State to store friends from server
  console.log("members", members); // Log members for debugging

  // Use groupInfo directly for members data
  useEffect(() => {
    if (isOpen && selectedChat.members) {
      socket.emit("join_user", user.userID);
      setFriendsFromServer(members || []); // Use members prop directly
      setLoading(true);
      setMembersInfo(selectedChat.members); // Directly use groupInfo.members
      setLoading(false);
      socket.on("outMemberr",(data)=>{
        console.log("outMemberr",data);
        setFriendsFromServer(data);
    });
    }
    return () => {
      socket.off("outMemberr"); // Clean up the event listener
    }
  }, [isOpen, selectedChat.members,user]);



  // Handle remove member
  const handleRemoveMember = (memberID) => {
    //setLoading(true);
    socket.emit("deleteMember",{
      chatID: selectedChat.chatID,
      adminID:user.userID,
      memberID: memberID,
    });
    
   
  };
  const userRolee = selectedChat.members.find(
    (member) => member.userID === user.userID
  )?.role || null;  // Nếu không tìm thấy, trả về null
  console.log(userRolee);
  
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
                  {member.userID === user.userID && userRolee === 'admin' ? 'Admin' : 'Thành viên'}
                </span>
                {userRolee === 'admin' && member.userID !== user.userID && (
                  <div>
                    <button
                      className="remove-member-btn"
                      onClick={() => handleRemoveMember(member.userID)}
                    >
                      Xóa
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
