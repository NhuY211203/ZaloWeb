
import React, { useState ,useEffect} from "react";
import { FaUsers, FaChevronDown, FaImage, FaFileAlt, FaLink, FaSignOutAlt, FaTrash } from "react-icons/fa";
import GroupMembersModal from "./GroupMembersModal "; // Import modal mới
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const ChatInfo = ({
  selectedChat,
  userRole,
  groupInfo,
  user,
  handleAddMember,
  handleDissolveGroup,
  handleRemoveMember,
  handleChangeRole,
  handleTransferRole,
  handleLeaveGroup,
  mediaImages,
  mediaVideos,
  mediaFiles,
  mediaLinks,
  onLeaveGroupSuccess
}) => {
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false); // State để mở/đóng modal

  const [members, setMembers] = useState([]); // State để lưu danh sách thành viên nhóm
  const [length, setLength] = useState(0); // State để lưu độ dài danh sách thành viên nhóm
  const getMemberList = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/InforMember", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ members: selectedChat.members }), // Send members data to server
      });

      const data = await response.json();
      if (response.ok) {
        setMembers(data);
        setLength(data.length); // Cập nhật độ dài danh sách thành viên nhóm
        console.log("📦 members:", data);
      } else {
        console.error("❌ Error fetching friends list:", data.message);
      }
    } catch (error) {
      console.error("❌ Fetch failed:", error.message);
    }
  };
  useEffect(() => {
      if (!user) return;
      getMemberList(); // Gọi hàm lấy danh sách thành viên nhóm
      socket.emit('join_user', user.userID); // Tham gia vào phòng socket của người dùng
      socket.on("newMember",(data)=>{
          setMembers(data)
          setLength(data.length)
      });

      socket.on("outMember", (data) => {
            setMembers(data);
            setLength(data.length); // Cập nhật độ dài danh sách thành viên nhóm
            console.log("📦 members:", data)
            }
        );
      socket.on("outMemberr",(data)=>{
          setMembers([...data]);
          setLength(data.length); // Cập nhật độ dài danh sách thành viên nhóm
          console.log("📦 members:", data);
      })
      return () => {
          socket.off("newMember");
          socket.off("outMember"); // Dọn dẹp sự kiện khi component unmount
          socket.off("outMemberr");

      }
    }, [user]);
    console.log("📦 members:", members);
  const handleOpenMembersModal = () => {
    setIsMembersModalOpen(true); // Mở modal
  };

  const handleCloseMembersModal = () => {
    setIsMembersModalOpen(false); // Đóng modal
  };

  const handleOutGroup = () => {
    console.log("Rời nhóm", selectedChat.chatID, user.userID);
    socket.emit("removeMember", {chatID: selectedChat.chatID, memberID: user.userID});
    if (onLeaveGroupSuccess) {
      onLeaveGroupSuccess(); // 💥 QUAN TRỌNG
    }

  }

  return (
    <div className="content2">
      <h2>{selectedChat.type === "group" ? "Thông tin nhóm" : "Thông tin hội thoại"}</h2>
      <div className="chat-info">
        <div style={{ position: "relative" }}>
          {selectedChat.type === "private" &&
            selectedChat.lastMessage?.find((msg) => msg.senderID !== user.userID) && (
              <img
                src={selectedChat.lastMessage.find((msg) => msg.senderID !== user.userID)?.senderInfo?.avatar}
                alt="avatar"
                className="avatar"
              />
            )}
          {selectedChat.type === "group" && (
            <>
              <img
                src={groupInfo?.avatar || "https://cdn-icons-png.flaticon.com/512/9131/9131529.png"}
                alt="group avatar"
                className="avatar"
              />
            </>
          )}
        </div>

        {/* Group Name */}
        <h3>{selectedChat.type === "group" ? groupInfo?.name || selectedChat.name : selectedChat.name}</h3>

        {/* Group Actions */}
        {selectedChat.type === "group" && (
          <div className="group-actions">
            <button className="group-action-btn" onClick={handleAddMember}>
              <FaUsers className="icon" />
              Thêm thành viên
            </button>
            {userRole === "admin" && (
              <button className="group-action-btn" onClick={handleDissolveGroup}>
                <FaTrash className="icon" style={{ color: "#ff4d4f" }} />
                Giải tán nhóm
              </button>
            )}
          </div>
        )}

        {/* Members Section */}
        {selectedChat.type === "group" && (
          <div className="info-section">
            <button onClick={handleOpenMembersModal} className="info-header">
              <div className="info-headerr">
                <FaUsers className="info-icon" />
                <h4>Thành viên nhóm: {length || 0} thành viên</h4>
              </div>
            </button>
          </div>
        )}

        {/* Media Section */}
        <div className="info-section">
          <div className="info-header">
            <FaImage className="info-icon" />
            <h4>Ảnh/Video</h4>
          </div>
          {mediaImages.length > 0 || mediaVideos.length > 0 ? (
            <div className="media-grid">
              {mediaImages.map((img) => (
                <img key={img.id} src={img.url} alt="media" />
              ))}
              {mediaVideos.map((vid) => (
                <video key={vid.id} src={vid.url} controls />
              ))}
            </div>
          ) : (
            <p>Chưa có Ảnh/Video được chia sẻ trong hội thoại này</p>
          )}
        </div>

        {/* File Section */}
        <div className="info-section">
          <div className="info-header">
            <FaFileAlt className="info-icon" />
            <h4>File</h4>
          </div>
          {mediaFiles.length > 0 ? (
            mediaFiles.map((file) => (
              <div key={file.id} className="file-item">
                <a href={file.url} download={file.name}>{file.name}</a>
              </div>
            ))
          ) : (
            <p>Chưa có File được chia sẻ trong hội thoại này</p>
          )}
        </div>

        {/* Links Section */}
        <div className="info-section">
          <div className="info-header">
            <FaLink className="info-icon" />
            <h4>Link</h4>
          </div>
          {mediaLinks.length > 0 ? (
            mediaLinks.map((link) => (
              <div key={link.id} className="link-item">
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.url}
                </a>
              </div>
            ))
          ) : (
            <p>Chưa có Link được chia sẻ trong hội thoại này</p>
          )}
        </div>

        {/* Leave or Delete */}
        {selectedChat.type === "group" && userRole !== "admin" && (
          <button className="leave-group-btn" onClick={handleOutGroup}>
            <FaSignOutAlt className="leave-icon" />
            Rời nhóm
          </button>
        )}
        {selectedChat.type !== "group" && (
          <button className="delete-chat">
            <FaTrash className="delete-icon" />
            Xóa lịch sử trò chuyện
          </button>
        )}
      </div>

      {/* Show Members Modal */}
      <GroupMembersModal
        isOpen={isMembersModalOpen}
        handleClose={handleCloseMembersModal}
        selectedChat={selectedChat}
        userRole={userRole}
        handleRemoveMember={handleRemoveMember}
        handleChangeRole={handleChangeRole}
        handleTransferRole={handleTransferRole}
        user={user}
        members={members}
      />
    </div>
  );
};

export default ChatInfo;