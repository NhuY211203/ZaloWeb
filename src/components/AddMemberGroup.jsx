
import React, { useState, useEffect } from "react";
import { FaSearch, FaUserPlus, FaUsers } from "react-icons/fa";
import "../styles/AddMemberGroup.css"; // Tạo file CSS mới cho modal này
import { io } from "socket.io-client";

const socket = io("https://cnm-service.onrender.com");

const AddMemberGroup = ({
  isModalOpen,
  handleCloseModal,
  user,
  chatID,
  groupInfo,
  onMembersAdded,
}) => {
  const [selectedMembers, setSelectedMembers] = useState([]); // Thành viên được chọn để thêm
  const [searchQuery, setSearchQuery] = useState(""); // Tìm kiếm bạn bè
  const [users, setUsers] = useState([]); // Danh sách bạn bè
  const [loading, setLoading] = useState(true); // Trạng thái tải danh sách bạn bè


  useEffect(() => {
    if (!user) return;
    socket.emit('join_user', user.userID); // Tham gia vào phòng socket của người dùng
  }, [user]);

  //📥 Lấy danh sách bạn bè từ server
  const getFriendsList = async () => {
    if (!user?.userID || !chatID) {
      console.error("❌ Người dùng hoặc chatID không hợp lệ:", { userID: user?.userID, chatID });
      return;
    }

    try {
      console.log("🔄 Đang lấy danh sách bạn bè với userID:", user.userID, "và chatID:", chatID);

      const response = await fetch("https://cnm-service.onrender.com/api/getMemberAddMember", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID: user.userID, chatID: chatID }),
      });

      const data = await response.json();
      console.log("📦 Phản hồi từ server:", data);

      if (response.ok) {
        // API trả về { message, friends }, lấy danh sách friends
        const friendsNotInGroup = data.friends || [];
        setUsers(friendsNotInGroup); // Cập nhật danh sách bạn bè chưa có trong nhóm
      } else {
        console.error("❌ Lỗi khi lấy danh sách bạn bè:", data.message);
      }
    } catch (error) {
      console.error("❌ Lỗi khi gọi API:", error.message);
    } finally {
      setLoading(false); // Đánh dấu việc tải xong
    }
  };


  // Gọi API khi user có giá trị và userID hợp lệ
  useEffect(() => {
    if (user?.userID && chatID && isModalOpen) {
      setLoading(true);
      getFriendsList();
    }
  }, [user?.userID, chatID, isModalOpen]);


  // Xử lý tìm kiếm
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Thêm thành viên vào danh sách đã chọn
  const handleAddMember = (friend) => {
    if (!selectedMembers.includes(friend.userID)) {
      setSelectedMembers([...selectedMembers, friend.userID]);
    }
    console.log("Thành viên đã chọn:",selectedMembers);
  };

  // Xóa thành viên khỏi danh sách đã chọn
  const handleRemoveMember = (userId) => {
    setSelectedMembers(selectedMembers.filter((id) => id !== userId));
  };

const sendNotification = (content) => {
  if (!content.trim()) return;

  const tempID = Date.now().toString();

  const newNotification = {
    tempID,
    chatID:chatID,
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


const handleAddMembersToGroup = async () => {
  if (selectedMembers.length === 0) {
    alert("Vui lòng chọn ít nhất một thành viên để thêm vào nhóm.");
    return;
  }
  if (!chatID) {
  console.error("❌ chatID không hợp lệ:", chatID);   
  return
}
  const newMembers = selectedMembers.map((member) =>member.userID);
  const data = {
    chatID: chatID,
    members: selectedMembers, // Đổi từ "members" thành "memberIDs"
  };
  console.log("📦 Dữ liệu gửi đến server:", newMembers);
  console.log("🔄 Gửi yêu cầu thêm thành viên:", data);
   const selected = users.find(friend => friend.userID === data.members[0]);
   console.log("📦 selected:", selected);
   const namemember = selected ? selected.name : '';
   const content = `${namemember} đã được ${user.name} thêm vào nhóm.`;
   sendNotification(content);
   socket.emit("AddMember", data);
   handleCloseModal();
   
};

  // Lọc bạn bè theo tên hoặc số điện thoại
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.sdt && user.sdt.includes(searchQuery))
  );

  return (
    <div className={`modal ${isModalOpen ? "open" : ""}`}>
      <div className="modal-content-group">
        <div className="modal-header">
          <h2>Thêm thành viên</h2>
          <button className="close-btn" onClick={handleCloseModal}>
            ✖
          </button>
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
            <p>Không có bạn bè nào để thêm.</p>
          ) : (
            filteredUsers.map((friend) => (
              <div key={friend.userID} className="search-result-item">
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(friend.userID)}
                  onChange={() => handleAddMember(friend)}
                />
                <img src={friend.avatar} alt="Avatar" className="avatar" />
                {friend.name}
              </div>
            ))
          )}
        </div>

        <div className="selected-members">
          <h3>Đã chọn: {selectedMembers.length}</h3>
          {selectedMembers.length > 0 && (
            <div>
              {users
                .filter((friend) => selectedMembers.includes(friend.userID))
                .map((friend) => (
                  <div key={friend.userID} className="selected-member">
                    <img src={friend.avatar} alt="Avatar" className="avatar" />
                    <span>{friend.name}</span>
                    <button onClick={() => handleRemoveMember(friend.userID)}>Xóa</button>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={handleAddMembersToGroup} className="create-group-btn">
            Thêm thành viên
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMemberGroup;