import React, { useState } from "react";
import { FaSearch, FaUserPlus, FaUsers } from "react-icons/fa"; // Import icons
import "../styles/AddGroupModal.css"; // Import CSS for styling

const AddGroupModal = ({ isModalOpen, handleCloseModal, user, onGroupCreate }) => {
  const [groupName, setGroupName] = useState(""); // To store group name
  const [selectedMembers, setSelectedMembers] = useState([]); // To store selected group members
  const [searchQuery, setSearchQuery] = useState(""); // For search functionality
  const [selectedGroupImage, setSelectedGroupImage] = useState(null); // To store selected group image

  const [users, setUsers] = useState([  // This would be replaced with your actual users fetching logic
    { id: "1", name: "Văn A", avatar: "https://example.com/avatar.jpg" },
    { id: "2", name: "C3", avatar: "https://example.com/avatar2.jpg" },
    { id: "3", name: "Tru Ngon Ngữ Trung", avatar: "https://example.com/avatar3.jpg" },
    { id: "4", name: "Tuấn", avatar: "https://example.com/avatar4.jpg" },
    { id: "5", name: "Anh", avatar: "https://example.com/avatar5.jpg" },
  ]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleAddMember = (user) => {
    if (!selectedMembers.includes(user.id)) {
      setSelectedMembers([...selectedMembers, user.id]);
    }
  };

  const handleRemoveMember = (userId) => {
    setSelectedMembers(selectedMembers.filter((id) => id !== userId));
  };

  const handleCreateGroup = () => {
    const groupInfo = {
      groupName,
      selectedMembers,
      groupImage: selectedGroupImage,
      createdBy: user.userID
    };

    // Pass the group info back to HomePage for adding to the chat list
    onGroupCreate(groupInfo);

    console.log("Group created with name:", groupName);
    console.log("Selected Members:", selectedMembers);
    console.log("Selected Group Image:", selectedGroupImage);

    handleCloseModal(); // Close the modal after creating the group
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedGroupImage(URL.createObjectURL(file)); // Create a temporary URL for the uploaded image
    }
  };

  return (
    <div className={`modal ${isModalOpen ? "open" : ""}`}>
      <div className="modal-content-group">
        <div className="modal-header">
          <h2>Tạo nhóm</h2>
          <button className="close-btn" onClick={handleCloseModal}>✖</button>
        </div>

        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent:"center" }}>
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
          {users
            .filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((user) => (
              <div key={user.id} className="search-result-item">
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(user.id)}
                    onChange={() => handleAddMember(user)}
                  />
                  <img src={user.avatar} alt="Avatar" className="avatar" />
                  {user.name}
              </div>
            ))}
        </div>

        <div className="selected-members">
          <h3>Đã chọn: {selectedMembers.length}</h3>
          {selectedMembers.length > 0 && (
            <div>
              {users
                .filter((user) => selectedMembers.includes(user.id))
                .map((user) => (
                  <div key={user.id} className="selected-member">
                    <img src={user.avatar} alt="Avatar" className="avatar" />
                    <span>{user.name}</span>
                    <button onClick={() => handleRemoveMember(user.id)}>Xóa</button>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={handleCreateGroup} className="create-group-btn">Tạo nhóm</button>
        </div>
      </div>
    </div>
  );
};

export default AddGroupModal;
