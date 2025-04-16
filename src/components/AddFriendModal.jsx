import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/AddFriendModal.css";
import InfoSearchModal from "../components/InfoSearchModal";

const AddFriendModal = ({ isModalOpen, handleCloseModal }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [friendStatus, setFriendStatus] = useState("");
  const [isSearchResultModalOpen, setIsSearchResultModalOpen] = useState(false);
  const userID = sessionStorage.getItem("userID");

  const handleSearch = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      if (!userID) {
        setErrorMessage("Bạn chưa đăng nhập.");
        return;
      }

      const response = await axios.post("https://echoapp-rho.vercel.app/api/search-friend-by-phone", {
        phoneNumber: phoneNumber,
        userID: userID,
      });

      if (response.status === 200) {
        const { friendStatus, ...userDetails } = response.data;
        setUserData(userDetails);
        setFriendStatus(friendStatus);
        setErrorMessage("");
        setIsSearchResultModalOpen(true);
      } else {
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      setErrorMessage(error.response ? error.response.data.message : "Không tìm thấy người dùng hoặc có lỗi xảy ra.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFriend = async () => {
    try {
      const response = await axios.post("https://echoapp-rho.vercel.app/api/send-friend-request", {
        phoneNumber: phoneNumber,
        userID: userID,
        name: userData.name,
        image: userData.image,
      });

      if (response.status === 200) {
        setFriendStatus("pending");
      }
    } catch (error) {
      setErrorMessage("Có lỗi xảy ra khi gửi yêu cầu kết bạn.");
    }
  };

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
                <input
                  className="sdt"
                  type="text"
                  placeholder="Số điện thoại"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              {errorMessage && <div className="error-message">{errorMessage}</div>}

              <div className="modal-footer">
                <button onClick={handleCloseModal} className="cancel-btn">Hủy</button>
                <button
                  onClick={handleSearch}
                  className="search-btn"
                  disabled={isLoading}
                >
                  {isLoading ? "Đang tìm kiếm..." : "Tìm kiếm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isSearchResultModalOpen && userData && (
        <InfoSearchModal
          isModalOpen={isSearchResultModalOpen}
          handleCloseModal={() => setIsSearchResultModalOpen(false)}
          userData={userData}
          friendStatus={friendStatus}
          handleAddFriend={handleAddFriend}
        />
      )}
    </>
  );
};

export default AddFriendModal;
