import React, { useState } from "react";
import * as FaIcons from "react-icons/fa";
import AddFriendModal from "./AddFriendModal"; // Import Modal

const SearchBar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false); // Quản lý trạng thái modal

  const handleOpenModal = () => {
    setIsModalOpen(true); // Mở modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Đóng modal
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
        <button onClick={handleOpenModal}>
          <FaIcons.FaUserPlus />
        </button>

        {/* Modal sẽ được gọi ở đây */}
        <AddFriendModal 
          isModalOpen={isModalOpen} 
          handleCloseModal={handleCloseModal} 
        />

        <span className="add-group-icon">
          <FaIcons.FaUsers />
        </span>
      </div>
    </div>
  );
};

export default SearchBar;