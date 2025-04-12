import React from "react";
import "../styles/InfoSearchModal.css"; // Import CSS for the search result modal
import UserProfileModal from "../components/UserProfileModal"; // Import UserProfileModal

const InfoSearchModal = ({ isModalOpen, handleCloseModal, userData, friendStatus, handleAddFriend }) => {
  return (
    <>
      {isModalOpen && (
        <div className="modal-overlayy">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Thông tin tìm kiếm</h2>
              <button onClick={handleCloseModal} className="close-btn">✖</button>
            </div>
            <div className="modal-body">
              <div className="user-found">
                {/* <img
                  src={userData.anhBia}
                  alt="User Avatar"
                  className="user-avatar"
                /> */}
                <img
                  
                  src={userData.avatar}
                  alt="User Avatar"
                  className="user-avatar"
                />
                <p>Tên tài khoản: {userData.name}</p>
                <p>Số điện thoại: {userData.phoneNumber} </p>

                {/* Check if user is the current user */}
                {friendStatus === "self" ? (
                  // <UserProfileModal userData={userData} />
                  <button className="btn-profile">Đây là tài khoản của bạn</button>
                ) : friendStatus === "pending" ? (
                  <button className="btn-pending">Yêu cầu kết bạn đang chờ duyệt</button>
                ) : friendStatus === "accepted" ? (
                  <button className="btn-message">Nhắn tin</button>
                ) : (
                  <button
                    className="send-friend-request-btn"
                    onClick={handleAddFriend}
                  >
                    Gửi yêu cầu kết bạn
                  </button>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={handleCloseModal} className="cancel-btn">Hủy</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InfoSearchModal;
