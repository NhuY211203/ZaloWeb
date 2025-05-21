import React, { useState ,useEffect} from "react";
import { FaUsers, FaChevronDown, FaImage, FaFileAlt, FaLink, FaSignOutAlt, FaTrash, FaExchangeAlt } from "react-icons/fa";
//import { FaUsers, FaChevronDown, FaImage, FaFileAlt, FaLink, FaSignOutAlt, FaTrash } from "react-icons/fa";
import GroupMembersModal from "./GroupMembersModal "; // Import modal mới
import LeaveGroupModal from "./LeaveGroupModal"; // Import modal mới
import "../styles/ChatInfo.css";
import { io } from "socket.io-client";
const socket = io("https://cnm-service.onrender.com");
//const socket = io('https://cnm-service.onrender.com');
const ChatInfo = ({
  selectedChat,
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
  onLeaveGroupSuccess,

  isSearchOpen, // Thêm prop để kiểm tra trạng thái tìm kiếm
  setIsSearchOpen, // Thêm prop để đóng giao diện tìm kiếm
  searchKeyword, // Thêm prop để lưu từ khóa tìm kiếm
  setSearchKeyword, // Thêm prop để cập nhật từ khóa
  searchResults, // Thêm prop để lưu kết quả tìm kiếm
  setSearchResults // Thêm prop để cập nhật kết quả tìm kiếm
}) => {
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false); // State để mở/đóng modal
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [members, setMembers] = useState([]); // State để lưu danh sách thành viên nhóm
  const [length, setLength] = useState(0); // State để lưu độ dài danh sách thành viên nhóm
  const [leave,setLeave] = useState(false); // State để lưu trạng thái loading
  const [showAllMedia, setShowAllMedia] = useState({ images: false, videos: false, files: false, links: false });
  const [activeTab, setActiveTab] = useState("images");
  const [userRolee, setUserRole] = useState(null); // State để lưu vai trò của người dùng trong nhóm

  const toggleMediaView = (type) => {
    setShowAllMedia(prev => ({ ...prev, [type]: !prev[type] }));
  };
  console.log("📦 selectedChat:", selectedChat);
  const getMemberList = async () => {
    try {
      const response = await fetch("https://cnm-service.onrender.com/api/InforMember", {
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
 

const handleUpdateChatt = (data) => {
  console.log("📦 updateChatt:", data);
  setUserRole(data?.members?.find((member) => member.userID === user.userID)?.role || null);
  setChats(data);
};
  useEffect(() => {
      if (!user) return;
      setChats(selectedChat);
      console.log("📦 selectedChat:",chats);
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
      socket.on("UpdateRole", (data) => {
        setMembers([...data]);
        setLength(data.length); // Cập nhật độ dài danh sách thành viên nhóm
        console.log("📦 members:", data)
        });
        socket.on("updateChatt", handleUpdateChatt);
    socket.on("updateMemberChattt", handleUpdateChatt);
    socket.on("updateMemberChat", handleUpdateChatt);
    socket.on("updateChatmember",handleUpdateChatt);
      return () => {
          socket.off("newMember");
          socket.off("outMember"); // Dọn dẹp sự kiện khi component unmount
          socket.off("outMemberr");
          socket.off("UpdateRole");
          socket.off("updateChatt", handleUpdateChatt);
          socket.off("updateMemberChattt", handleUpdateChatt);
          socket.off("updateMemberChat", handleUpdateChatt);
          socket.off("updateChatmember",handleUpdateChatt);
      }
    }, [user,selectedChat]);
    console.log("📦 members:", members);
    console.log("📦 chats:", chats);
     useEffect(() => {
  if (!chats || !user) return;
  const role = chats?.members?.find((member) => member.userID === user.userID)?.role || null;
  setUserRole(role);
}, [chats, user]);
  const handleOpenMembersModal = () => {
    setIsMembersModalOpen(true); // Mở modal
  };

  const handleCloseMembersModal = () => {
    setIsMembersModalOpen(false); // Đóng modal
  };
  const openLeaveModal = () => setIsLeaveModalOpen(true);
  const closeLeaveModal = () => setIsLeaveModalOpen(false);
 
 
  const sendNotification = (content) => {
  if (!content.trim()) return;

  const tempID = Date.now().toString();

  const newNotification = {
    tempID,
    chatID: selectedChat.chatID,
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
   const handleOutGroup = () => {
    if(userRolee === "admin"){
      // alert("Bạn không thể rời nhóm khi đang là quản trị viên!");
      // return;
      setLeave(true);
      openLeaveModal();
     } else{
    console.log("Rời nhóm", selectedChat.chatID, user.userID);
    const content = `${user.name} đã rời khỏi nhóm chat.`;
    sendNotification(content);
    socket.emit("removeMember", {chatID: selectedChat.chatID, memberID: user.userID});
    if (onLeaveGroupSuccess) {
      onLeaveGroupSuccess(); // 💥 QUAN TRỌNG
    }
  }
  }

  const handleSearch = () => {
    if (!searchKeyword.trim()) {
      setSearchResults([]);
      return;
    }
  
    const keyword = searchKeyword.toLowerCase();
    const results = [];
  
    // Tìm trong nội dung tin nhắn (text, emoji)
    chats.lastMessage.forEach((msg) => {
      if (msg.type === "text" || msg.type === "emoji") {
        if (msg.content.toLowerCase().includes(keyword)) {
          results.push({ type: "message", content: msg.content, timestamp: msg.timestamp });
        }
      }
    });
  
    // Tìm trong tên file
    mediaFiles.forEach((file) => {
      if (file.name.toLowerCase().includes(keyword)) {
        results.push({ type: "file", name: file.name, url: file.url, timestamp: file.timestamp });
      }
    });
  
    // Tìm trong link
    mediaLinks.forEach((link) => {
      if (link.url.toLowerCase().includes(keyword)) {
        results.push({ type: "link", url: link.url, timestamp: link.timestamp });
      }
    });
  
    // Sắp xếp kết quả theo thời gian
    results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    setSearchResults(results);
  };


return (
  <div className="content2">
    {isSearchOpen ? (
      <>
        {/* Thanh tìm kiếm */}
        <div className="search-bar" style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
          <input
            type="text"
            placeholder="Tìm kiếm tin nhắn..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            style={{
              flex: 1,
              padding: "8px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              marginRight: "10px",
            }}
          />
          <button
            onClick={() => {
              setIsSearchOpen(false);
              setSearchKeyword("");
              setSearchResults([]);
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#666",
            }}
          >
            <FaSignOutAlt size={20} />
          </button>
        </div>

        {/* Hiển thị kết quả tìm kiếm */}
        <div className="search-results" style={{ maxHeight: "500px", overflowY: "auto" }}>
          {searchResults.length > 0 ? (
            searchResults.map((result, index) => (
              <div
                key={index}
                style={{
                  padding: "10px",
                  borderBottom: "1px solid #eee",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  {result.type === "message" && <span>{result.content}</span>}
                  {result.type === "file" && (
                    <a href={result.url} download={result.name}>
                      {result.name}
                    </a>
                  )}
                  {result.type === "link" && (
                    <a href={result.url} target="_blank" rel="noopener noreferrer">
                      {result.url}
                    </a>
                  )}
                </div>
                <span style={{ fontSize: "12px", color: "#666" }}>
                  {new Date(result.timestamp).toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <p style={{ color: "#666", textAlign: "center" }}>
              {searchKeyword ? "Không tìm thấy kết quả" : "Nhập từ khóa để tìm kiếm"}
            </p>
          )}
        </div>
      </>
    ) : (
      <>
        {/* Giao diện thông tin nhóm/hội thoại hiện tại */}
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
                  src={selectedChat?.avatar || "https://cdn-icons-png.flaticon.com/512/9131/9131529.png"}
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
              {selectedChat.members.find(m => m.userID === user.userID && m.role === 'admin') && (
                <button className="group-action-btn" onClick={() => {
                  openLeaveModal();
                  setLeave(false);
                  // console.log("Chuyển quyền với chatID:", selectedChat.chatID);
                  // socket.emit("transferRole", { chatID: selectedChat.chatID });
                }}>
                  <FaExchangeAlt className="icon" style={{ color: "#007bff" }} />
                  Chuyển quyền
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

          {/* Media Section Image/ video */}
          <div className="info-section">
            <div className="info-header">
              <FaImage className="info-icon" />
              <h4>Ảnh</h4>
            </div>
            {showAllMedia.images ? (
              <div className="media-full-view">
                <div className="media-tabs">
                  <button className={activeTab === "images" ? "active" : ""} onClick={() => setActiveTab("images")}>Ảnh</button>
                  <button className={activeTab === "videos" ? "active" : ""} onClick={() => setActiveTab("videos")}>Video</button>
                  <button className={activeTab === "files" ? "active" : ""} onClick={() => setActiveTab("files")}>File</button>
                  <button className={activeTab === "links" ? "active" : ""} onClick={() => setActiveTab("links")}>Link</button>
                  <button className="back-btn" onClick={() => toggleMediaView("images")}>
                    ← Quay lại
                  </button>
                </div>
                {activeTab === "images" && (
                  <div className="media-grid">
                    {mediaImages
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((img) => (
                        <div key={img.id} className="media-item">
                          <img src={img.url} alt="media" />
                        </div>
                      ))}
                  </div>
                )}
                {activeTab === "videos" && (
                  <div className="media-grid">
                    {mediaVideos
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((vid) => (
                        <div key={vid.id} className="media-item">
                          <video src={vid.url} controls />
                        </div>
                      ))}
                  </div>
                )}
                {activeTab === "files" && (
                  <div className="media-grid">
                    {mediaFiles.map((file) => (
                      <div key={file.id} className="file-item">
                        <a href={file.url} download={file.name}>{file.name}</a>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === "links" && (
                  <div className="media-grid">
                    {mediaLinks.map((link) => (
                      <div key={link.id} className="link-item">
                        <a href={link.url} target="_blank" rel="noopener noreferrer">{link.url}</a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="media-grid">
                {mediaImages.slice(0, 3).map((img) => (
                  <div key={img.id} className="media-item">
                    <img src={img.url} alt="media" />
                  </div>
                ))}
                {mediaImages.length > 3 && (
                  <button className="view-all" onClick={() => toggleMediaView("images")}>Xem tất cả</button>
                )}
                {mediaImages.length === 0 && <p>Chưa có ảnh được chia sẻ trong hội thoại này</p>}
              </div>
            )}
          </div>

          <div className="info-section">
            <div className="info-header">
              <FaImage className="info-icon" />
              <h4>Video</h4>
            </div>
            {showAllMedia.videos ? (
              <div className="media-full-view">
                <div className="media-tabs">
                  <button className={activeTab === "images" ? "active" : ""} onClick={() => setActiveTab("images")}>Ảnh</button>
                  <button className={activeTab === "videos" ? "active" : ""} onClick={() => setActiveTab("videos")}>Video</button>
                  <button className={activeTab === "files" ? "active" : ""} onClick={() => setActiveTab("files")}>File</button>
                  <button className={activeTab === "links" ? "active" : ""} onClick={() => setActiveTab("links")}>Link</button>
                  <button className="back-btn" onClick={() => toggleMediaView("videos")}>
                    ← Quay lại
                  </button>
                </div>
                {activeTab === "images" && (
                  <div className="media-grid">
                    {mediaImages
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((img) => (
                        <div key={img.id} className="media-item">
                          <img src={img.url} alt="media" />
                        </div>
                      ))}
                  </div>
                )}
                {activeTab === "videos" && (
                  <div className="media-grid">
                    {mediaVideos
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((vid) => (
                        <div key={vid.id} className="media-item">
                          <video src={vid.url} controls />
                        </div>
                      ))}
                  </div>
                )}
                {activeTab === "files" && (
                  <div className="media-grid">
                    {mediaFiles.map((file) => (
                      <div key={file.id} className="file-item">
                        <a href={file.url} download={file.name}>{file.name}</a>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === "links" && (
                  <div className="media-grid">
                    {mediaLinks.map((link) => (
                      <div key={link.id} className="link-item">
                        <a href={link.url} target="_blank" rel="noopener noreferrer">{link.url}</a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="media-grid">
                {mediaVideos.slice(0, 3).map((vid) => (
                  <div key={vid.id} className="media-item">
                    <video src={vid.url} controls />
                  </div>
                ))}
                {mediaVideos.length > 3 && (
                  <button className="view-all" onClick={() => toggleMediaView("videos")}>Xem tất cả</button>
                )}
                {mediaVideos.length === 0 && <p>Chưa có video được chia sẻ trong hội thoại này</p>}
              </div>
            )}
          </div>

          {/* File Section */}
          <div className="info-section">
            <div className="info-header">
              <FaFileAlt className="info-icon" />
              <h4>File</h4>
            </div>
            {showAllMedia.files ? (
              <div className="media-full-view">
                <div className="media-tabs">
                  <button className={activeTab === "images" ? "active" : ""} onClick={() => setActiveTab("images")}>Ảnh</button>
                  <button className={activeTab === "videos" ? "active" : ""} onClick={() => setActiveTab("videos")}>Video</button>
                  <button className={activeTab === "files" ? "active" : ""} onClick={() => setActiveTab("files")}>File</button>
                  <button className={activeTab === "links" ? "active" : ""} onClick={() => setActiveTab("links")}>Link</button>
                  <button className="back-btn" onClick={() => toggleMediaView("files")}>
                    ← Quay lại
                  </button>
                </div>
                {activeTab === "images" && (
                  <div className="media-grid">
                    {mediaImages
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((img) => (
                        <div key={img.id} className="media-item">
                          <img src={img.url} alt="media" />
                        </div>
                      ))}
                  </div>
                )}
                {activeTab === "videos" && (
                  <div className="media-grid">
                    {mediaVideos
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((vid) => (
                        <div key={vid.id} className="media-item">
                          <video src={vid.url} controls />
                        </div>
                      ))}
                  </div>
                )}
                {activeTab === "files" && (
                  <div className="media-grid">
                    {mediaFiles.map((file) => (
                      <div key={file.id} className="file-item">
                        <a href={file.url} download={file.name}>{file.name}</a>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === "links" && (
                  <div className="media-grid">
                    {mediaLinks.map((link) => (
                      <div key={link.id} className="link-item">
                        <a href={link.url} target="_blank" rel="noopener noreferrer">{link.url}</a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="media-grid">
                {mediaFiles.slice(0, 3).map((file) => (
                  <div key={file.id} className="file-item">
                    <a href={file.url} download={file.name}>{file.name}</a>
                  </div>
                ))}
                {mediaFiles.length > 3 && (
                  <button className="view-all" onClick={() => toggleMediaView("files")}>Xem tất cả</button>
                )}
                {mediaFiles.length === 0 && <p>Chưa có file được chia sẻ trong hội thoại này</p>}
              </div>
            )}
          </div>

          {/* Links Section */}
          <div className="info-section">
            <div className="info-header">
              <FaLink className="info-icon" />
              <h4>Link</h4>
            </div>
            {showAllMedia.links ? (
              <div className="media-full-view">
                <div className="media-tabs">
                  <button className={activeTab === "images" ? "active" : ""} onClick={() => setActiveTab("images")}>Ảnh</button>
                  <button className={activeTab === "videos" ? "active" : ""} onClick={() => setActiveTab("videos")}>Video</button>
                  <button className={activeTab === "files" ? "active" : ""} onClick={() => setActiveTab("files")}>File</button>
                  <button className={activeTab === "links" ? "active" : ""} onClick={() => setActiveTab("links")}>Link</button>
                  <button className="back-btn" onClick={() => toggleMediaView("links")}>
                    ← Quay lại
                  </button>
                </div>
                {activeTab === "images" && (
                  <div className="media-grid">
                    {mediaImages
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((img) => (
                        <div key={img.id} className="media-item">
                          <img src={img.url} alt="media" />
                        </div>
                      ))}
                  </div>
                )}
                {activeTab === "videos" && (
                  <div className="media-grid">
                    {mediaVideos
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((vid) => (
                        <div key={vid.id} className="media-item">
                          <video src={vid.url} controls />
                        </div>
                      ))}
                  </div>
                )}
                {activeTab === "files" && (
                  <div className="media-grid">
                    {mediaFiles.map((file) => (
                      <div key={file.id} className="file-item">
                        <a href={file.url} download={file.name}>{file.name}</a>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === "links" && (
                  <div className="media-grid">
                    {mediaLinks.map((link) => (
                      <div key={link.id} className="link-item">
                        <a href={link.url} target="_blank" rel="noopener noreferrer">{link.url}</a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="media-grid">
                {mediaLinks.slice(0, 3).map((link) => (
                  <div key={link.id} className="link-item">
                    <a href={link.url} target="_blank" rel="noopener noreferrer">{link.url}</a>
                  </div>
                ))}
                {mediaLinks.length > 3 && (
                  <button className="view-all" onClick={() => toggleMediaView("links")}>Xem tất cả</button>
                )}
                {mediaLinks.length === 0 && <p>Chưa có link được chia sẻ trong hội thoại này</p>}
              </div>
            )}
          </div>

          {/* Leave or Delete */}
          {selectedChat.type === "group" && (
            <>
              {userRolee !== "admin" ? (
                <button className="leave-group-btn" onClick={handleOutGroup}>
                  <FaSignOutAlt className="leave-icon" />
                  Rời nhóm
                </button>
              ) : (
                <>
                  <button className="leave-group-btn" onClick={handleOutGroup}>
                    <FaSignOutAlt className="leave-icon" />
                    Rời nhóm
                  </button>
                  <button
                    className="leave-group-btn"
                    onClick={() => {
                      console.log("Giải tán nhóm với chatID:", chats.chatID);
                      socket.emit("deleteGroupAndMessages", { chatID: chats.chatID });
                    }}
                    style={{ marginTop: "10px" }}
                  >
                    <FaTrash className="leave-icon" />
                    Giải tán nhóm
                  </button>
                </>
              )}
            </>
          )}
          {selectedChat.type !== "group" && (
            <button className="delete-chat">
              <FaTrash className="delete-icon" />
              Xóa lịch sử trò chuyện
            </button>
          )}
        </div>
      </>
    )}

    {/* Show Members Modal */}
    <GroupMembersModal
      isOpen={isMembersModalOpen}
      handleClose={handleCloseMembersModal}
      selectedChat={selectedChat}
      handleRemoveMember={handleRemoveMember}
      handleChangeRole={handleChangeRole}
      handleTransferRole={handleTransferRole}
      user={user}
      members={members}
    />
    <LeaveGroupModal
    isOpen={isLeaveModalOpen}
    handleClose={closeLeaveModal}
    selectedChat={selectedChat} // nhóm đang chọn
    handleLeaveGroup={handleLeaveGroup} // hàm xử lý rời nhóm
    user={user}
    members={members} // danh sách thành viên nhóm
    leave={leave} // trạng thái loading
    setLeave={setLeave} // hàm cập nhật trạng thái loading
    />

  </div>
);
}
export default ChatInfo;