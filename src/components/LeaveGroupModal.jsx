import React, { useState, useEffect } from "react"; 
import { FaTimes } from "react-icons/fa"; 
import axios from "axios";
import "../styles/GroupMembersModal.css"; // Import CSS for modal
import { io } from "socket.io-client";
const socket = io("https://cnm-service.onrender.com");
const LeaveGroupModal = ({
  isOpen,
  handleClose,
  selectedChat,
  handleLeaveGroup,
  user,
  members,
  leave,
  setLeave
}) => {
  const [newAdmin, setNewAdmin] = useState(null); // State to store the selected new admin
  const [chats, setChats] = useState([]);
  const [memberss, setMembers] = useState([]);
  const handleUpdateChatt = (data) => {
    console.log("📦 updateChatt:", data);
    setChats(data);
  };
    useEffect(() => {
        if (!user) return;
        setChats(selectedChat);
        setMembers(members);
        console.log("📦 selectedChat:", chats);
        socket.emit('join_user', user.userID); // Tham gia vào phòng socket của người dùng
        socket.on("newMember",(data)=>{
            setMembers(data)  
        });
  
        socket.on("outMember", (data) => {
              setMembers(data);
              console.log("📦 members:", data)
              }
          );
        socket.on("outMemberr",(data)=>{
            setMembers([...data]);
            console.log("📦 members:", data);
        })
        socket.on("UpdateRole", (data) => {
          setMembers(data);
          console.log("📦 members:", data)
          });
          socket.on("updateChatt", handleUpdateChatt);
      socket.on("updateMemberChattt", handleUpdateChatt);
      socket.on("updateChatmember",handleUpdateChatt);
        return () => {
            socket.off("newMember");
            socket.off("outMember"); // Dọn dẹp sự kiện khi component unmount
            socket.off("outMemberr");
            socket.off("UpdateRole");
            socket.off("updateChatt", handleUpdateChatt);
            socket.off("updateMemberChattt", handleUpdateChatt);
            socket.off("updateChatmember",handleUpdateChatt);
  
  
        }
      }, [user,selectedChat,members]);
      
  const sendNotification = (content) => {
  if (!content.trim()) return;

  const tempID = Date.now().toString();

  const newNotification = {
    tempID,
    chatID: chats.chatID,
    senderID: user.userID,
    content,
    type: "notification",
    timestamp: new Date().toISOString(),
    media_url: [],
    status: "sent",
    pinnedInfo: null,
    senderInfo: { name: user.name, avatar: user.anhDaiDien },
  };
  socket.emit("send_message", newNotification);
};

  // Lọc các thành viên trừ admin
const adminIDs = chats?.members?.filter((member) => member.role === "admin")
  .map((admin) => admin.userID);

const membersExcludingAdmin = memberss?.filter(
  (member) => !adminIDs.includes(member.userID)
);

  console.log("📦 membersExcludingAdmin:",membersExcludingAdmin);

  // Hàm xử lý khi người dùng chọn một thành viên làm admin mới
  const handleAdminSelect = (member) => {
    setNewAdmin(member); // Cập nhật người admin mới khi chọn
  };

  // Hàm xác nhận khi người dùng rời nhóm
  const handleConfirmLeave = () => {
    if(leave){
        // alert("chuyển giao quyền admin và rời nhóm");
          socket.emit("updateAdmin",{
                        chatID:chats.chatID,
                        adminID:user.userID,
                        memberID: newAdmin.userID,
                    }); 
        const content1 = `${newAdmin.name} đã được bổ nhiệm là nhóm trưởng.`;
        sendNotification(content1);
        setTimeout(() => {
        const content = `${user.name} đã rời khỏi nhóm chat.`;
        sendNotification(content);
        socket.emit("removeMember", {chatID:chats.chatID, memberID:user.userID});
        setLeave(false);
        handleClose();
    }, 2000);
    } else{
       //alert("chuyển giao quyền admin ");
        socket.emit("updateAdmin",{
                        chatID:chats.chatID,
                        adminID:user.userID,
                        memberID: newAdmin.userID,
                    }); 
        const content = `${newAdmin.name} đã được bổ nhiệm là nhóm trưởng.`;
        sendNotification(content);
        handleClose();
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
                onClick={() => handleAdminSelect(member)}
                style={{
                  cursor: 'pointer', 
                  padding: '10px', 
                  border: '1px solid #ccc', 
                  marginBottom: '10px', 
                  display: 'flex', 
                  alignItems: 'center',
                  backgroundColor: newAdmin === member ? '#d3d3d3' : 'transparent'
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
          {leave ?(<button className="leave-group-button" onClick={handleConfirmLeave}>
          Chuyển Quyền Admin và Rời Nhóm
        </button>):(<button className="leave-group-button" onClick={handleConfirmLeave}>
          Chuyển Quyền Admin
        </button>)}
         
        </div>
      </div>
    </div>
  );
};

export default LeaveGroupModal;
