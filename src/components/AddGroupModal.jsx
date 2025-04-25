import React, { useState, useEffect } from "react";
import { FaSearch, FaUserPlus, FaUsers } from "react-icons/fa"; // Import icons
import "../styles/AddGroupModal.css"; // Import CSS for styling
import axios from "axios"; // Import axios để gọi API
import { io } from 'socket.io-client';
const socket = io('http://localhost:5000');
//const socket = io('https://cnm-service.onrender.com');

const AddGroupModal = ({ isModalOpen, handleCloseModal, user, onGroupCreate, onStartChat }) => {
  const [groupName, setGroupName] = useState(""); // To store group name
  const [selectedMembers, setSelectedMembers] = useState([]); // To store selected group members
  const [searchQuery, setSearchQuery] = useState(""); // For search functionality
  const [selectedGroupImage, setSelectedGroupImage] = useState(null); // To store selected group image
  const [users, setUsers] = useState([]); // To store the list of friends
  const [loading, setLoading] = useState(true); // To track if users are being loaded

  // 📥 Lấy danh sách bạn bè từ server
  const getFriendsList = async () => {
    if (!user?.userID) {
      console.error("❌ User is not available or userID is missing.");
      return; // Nếu user hoặc userID không hợp lệ, không gọi API
    }

    try {
      console.log("🔄 Fetching friends list with userID:", user.userID);

      const response = await fetch("https://echoapp-rho.vercel.app/api/ContacsFriendByUserID", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID: user.userID }),
      });

      const data = await response.json();
      console.log("📦 Server response:", data);

      if (response.ok) {
        setUsers(data); // Cập nhật danh sách bạn bè vào state
      } else {
        console.error("❌ Error fetching friends list:", data.message);
      }
    } catch (error) {
      console.error("❌ Fetch failed:", error.message);
    } finally {
      setLoading(false); // Đánh dấu việc tải xong
    }
  };

  // Chỉ gọi API khi user có giá trị và userID hợp lệ
  useEffect(() => {
    if (user?.userID) {
      setLoading(true); // Đánh dấu đang tải dữ liệu bạn bè
      getFriendsList(); // Fetch friends when user is available
    }
  }, [user?.userID]); // Run whenever user changes

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value); // Lưu giá trị tìm kiếm
  };

  const handleAddMember = (user) => {
    // Nếu thành viên chưa được chọn, thêm vào selectedMembers
    if (!selectedMembers.includes(user.userID)) {
      setSelectedMembers([...selectedMembers, user.userID]);
    }
  };

  const handleRemoveMember = (userId) => {
    // Loại bỏ thành viên khỏi selectedMembers
    setSelectedMembers(selectedMembers.filter((id) => id !== userId));
  };

  // 🛠 Tạo nhóm
  const handleCreateGroup = async () => {
    if (selectedMembers.length < 2) {
      alert("Vui lòng nhập tên nhóm và chọn ít nhất 2 thành viên.");
      return;
    }
    if (!groupName) {
      alert("Vui lòng nhập tên nhóm.");
      return;
    }
    const members = selectedMembers.map((memberId) => ({
      userID: memberId,
    }));

    const data = {
      adminID: user.userID,
      name: groupName,
      members: members,
      avatar: selectedGroupImage || "https://cdn-icons-png.flaticon.com/512/9131/9131529.png",
    };

    try {
      const response = await fetch("https://echoapp-rho.vercel.app/api/createGroupChat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });

      const chat = await response.json();
      if (!chat) {
        console.error("❌ Error creating group chat:", chat.message);
        return;
      }

      // Emit socket event to notify other users about the new chat
      socket.emit("createChat1-1", chat);

      // Navigate to the ChatScreen (or redirect as needed)
      // navigation.navigate("ChatScreen", { item: chat });
      onStartChat(chat);
      handleCloseModal (); // Đóng modal sau khi tạo nhóm thành công

      console.log("📦 New group data:", chat);
    } catch (error) {
      console.error("❌ Fetch failed:", error.message);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedGroupImage(URL.createObjectURL(file)); // Create a temporary URL for the uploaded image
    }
  };

  // Lọc bạn bè theo tên và số điện thoại dựa trên searchQuery
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.sdt.includes(searchQuery)
  );

  return (
    <div className={`modal ${isModalOpen ? "open" : ""}`}>
      <div className="modal-content-group">
        <div className="modal-header">
          <h2>Tạo nhóm</h2>
          <button className="close-btn" onClick={handleCloseModal}>
            ✖
          </button>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="group-image-selection">
            <label className="group-image-upload">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
              <div className="image-upload-button">
                {selectedGroupImage ? (
                  <img
                    src={selectedGroupImage}
                    alt="Selected Group"
                    className="group-image-preview"
                  />
                ) : (
                  <div className="image-placeholder">
                    <FaUsers className="image-icon" />
                  </div>
                )}
              </div>
            </label>
          </div>
          <div className="search-boxx">
            <input
              type="text"
              className="search-inputt"
              placeholder="Nhập tên nhóm..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
        </div>

        <div className="search-boxx">
          <input
            type="text"
            className="search-input-search"
            placeholder="Nhập tên bạn bè, số điện thoại..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        <div className="search-results">
          {loading ? (
            <p>Đang tải danh sách bạn bè...</p>
          ) : filteredUsers.length === 0 ? (
            <p>Không có bạn bè nào.</p>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.userID} className="search-result-item">
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(user.userID)} // Kiểm tra nếu thành viên đã chọn
                  onChange={() => handleAddMember(user)} // Thêm thành viên vào danh sách đã chọn
                />
                <img src={user.anhDaiDien} alt="Avatar" className="avatar" />
                {user.name}
              </div>
            ))
          )}
        </div>

        <div className="selected-members">
          <h3>Đã chọn: {selectedMembers.length}</h3>
          {selectedMembers.length > 0 && (
            <div>
              {users
                .filter((user) => selectedMembers.includes(user.userID)) // Hiển thị những người đã chọn
                .map((user) => (
                  <div key={user.userID} className="selected-member">
                    <img src={user.anhDaiDien} alt="Avatar" className="avatar" />
                    <span>{user.name}</span>
                    <button onClick={() => handleRemoveMember(user.userID)}>Xóa</button> {/* Xóa thành viên khỏi danh sách */}
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={handleCreateGroup} className="create-group-btn">
            Tạo nhóm
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddGroupModal;
