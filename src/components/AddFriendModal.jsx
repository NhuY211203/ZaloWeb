// AddFriendModal.jsx
import React, { useState } from 'react';
import * as FaIcons from 'react-icons/fa';
import '../styles/AddFriendModal.css'; // Import CSS cho modal

const AddFriendModal = ({ isModalOpen, handleCloseModal }) => {
    return (
      <>
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Thêm bạn</h2>
                <button onClick={handleCloseModal} className="close-btn">✖</button>
              </div>
              <div className="modal-body">
                <div className="search-info">
                  <span className="country-code">(+84)</span>
                  <input className="sdt" type="text" placeholder="Số điện thoại" />
                </div>
                {/* <div className="suggested-friends">
                  <div className="friend-item">
                    <span>Văn A</span>
                    <span>Từ số điện thoại</span>
                    <button className="add-friend-btn">Kết bạn</button>
                  </div>
                  <div className="friend-item">
                    <span>Văn A</span>
                    <span>Từ số điện thoại</span>
                    <button className="add-friend-btn">Kết bạn</button>
                  </div>
                </div> */}
              </div>
              <div className="modal-footer">
                <button onClick={handleCloseModal} className="cancel-btn">Hủy</button>
                <button className="search-btn">Tìm kiếm</button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };
  
  export default AddFriendModal;