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
  user,
  members
}) => {
  const [membersInfo, setMembersInfo] = useState([]); // State to store members info
  const [loading, setLoading] = useState(false); // Loading state
  const [friendsFromServer, setFriendsFromServer] = useState([]); // State to store friends from server
  const [chats, setChats] = useState([]); // State to store chats
  //console.log("members",selectedChat.members); // Log members for debugging

  // Use groupInfo directly for members data
  // Define handlers outside useEffect
  
const handleOutMember = (data) => {
  console.log("📦 outMember:", data);
  setFriendsFromServer(data);
};

const handleUpdateRole = (data) => {
  console.log("📦 UpdateRole:", data);
  setFriendsFromServer([...data]);
};

const handleUpdateChatt = (data) => {
  console.log("📦 updateChatt:", data);
  setChats(data);
};

// useEffect remains clean
useEffect(() => {
  if (isOpen && selectedChat.members) {
    socket.emit("join_user", user.userID);
    setFriendsFromServer(members || []);
    setLoading(true);
    setMembersInfo(selectedChat.members);
    setLoading(false);
    setChats(selectedChat);
    socket.on("newMember",(data)=>{
      setFriendsFromServer(data)
  });
    socket.on("outMember", handleOutMember);
    socket.on("UpdateRole", handleUpdateRole);
    socket.on("updateChatt", handleUpdateChatt);
    socket.on("updateMemberChattt", handleUpdateChatt);
    socket.on("outMemberr", handleUpdateRole);
  }

  return () => {
    socket.off("newMember");
    socket.off("outMember", handleOutMember);
    socket.off("UpdateRole", handleUpdateRole);
    socket.off("updateChatt", handleUpdateChatt);
    socket.off("updateMemberChattt", handleUpdateChatt);
    socket.off("outMemberr", handleUpdateRole);
  };
}, [isOpen, selectedChat.members, user]);




  // Handle remove member
  const handleRemoveMember = (memberID) => {
    //setLoading(true);
    socket.emit("deleteMember",{
      chatID: selectedChat.chatID,
      adminID:user.userID,
      memberID: memberID,
    });
    
   
  };
  const userRolee = chats?.members?.find(
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
            friendsFromServer.map((member,i) => (
              <div key={member.userID} className="member-item">
                <img src={member.avatar} alt="avatar" className="avatar-small" />
                {member.userID === user.userID ? (<span>Bạn</span>) : (
                  <span>{member.name}</span>
                )}
                {/* Hiển thị tên thành viên */}
                <span className="role-label">
                  {/* Hiể/n thị Admin nếu là admin, nếu không thì là thành viên */}
                  { chats?.members[i]?.role === 'admin' ? 'Admin' : 'Thành viên'}
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
