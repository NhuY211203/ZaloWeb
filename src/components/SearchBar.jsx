import React, { useState } from "react";
import * as FaIcons from "react-icons/fa";
import AddFriendModal from "./AddFriendModal"; // Import Modal
import AddGroupModal from "./AddGroupModal"; // Import AddGroupModal

const SearchBar = ({ user }) => {
  const [isFriendModalOpen, setIsFriendModalOpen] = useState(false); // Quản lý trạng thái Modal bạn bè
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false); // Quản lý trạng thái Modal nhóm

  // Mở Modal bạn bè
  const handleOpenFriendModal = () => {
    setIsFriendModalOpen(true);
  };

  // Đóng Modal bạn bè
  const handleCloseFriendModal = () => {
    setIsFriendModalOpen(false);
  };

  // Mở Modal nhóm
  const handleOpenGroupModal = () => {
    setIsGroupModalOpen(true);
  };

  // Đóng Modal nhóm
  const handleCloseGroupModal = () => {
    setIsGroupModalOpen(false);
  };

  return (
    <div className="search-bar">
      <div className="search-box">
        <span className="search-icon">
          <FaIcons.FaSearch />
        </span>
        <input
          type="text"
          className="search-input"
          placeholder="Tìm kiếm"
        />
      </div>
      <div className="search-icons">
        {/* Button mở Modal bạn bè */}
        <button onClick={handleOpenFriendModal}>
          <FaIcons.FaUserPlus />
        </button>

        {/* Modal bạn bè */}
        <AddFriendModal 
          isModalOpen={isFriendModalOpen} 
          handleCloseModal={handleCloseFriendModal} 
          user={user} 
        />

        {/* Button mở Modal nhóm */}
        <span className="add-group-icon" onClick={handleOpenGroupModal}>
          <FaIcons.FaUsers />
        </span>

        {/* Modal nhóm */}
        <AddGroupModal
          isModalOpen={isGroupModalOpen}
          handleCloseModal={handleCloseGroupModal}
          user={user}
        />
      </div>
    </div>
  );
};

export default SearchBar;
