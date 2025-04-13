import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // For navigation
import "../styles/AddFriendModal.css"; // Import CSS for the modal
import InfoSearchModal from "../components/InfoSearchModal"; // Import the new modal
import socketIOClient from "socket.io-client"; // Import socket.io client
const socket = socketIOClient("http://localhost:5000"); // Kết nối đến server

const AddFriendModal = ({ isModalOpen, handleCloseModal }) => {
  const [phoneNumber, setPhoneNumber] = useState(""); // Store phone number entered by user
  const [errorMessage, setErrorMessage] = useState(""); // Error message state
  const [userData, setUserData] = useState(null); // Store data about the user found
  const [isLoading, setIsLoading] = useState(false); // Loading state for the API request
  const [friendStatus, setFriendStatus] = useState(""); // Store friend status (self, pending, accepted)

  const [isSearchResultModalOpen, setIsSearchResultModalOpen] = useState(false); // Modal state for search result
  const userID = sessionStorage.getItem("userID"); // Get the current userID from sessionStorage

  const handleSearch = async () => {
    setIsLoading(true); // Set loading state to true while making API request
    setErrorMessage(""); // Reset error message

    try {
      if (!userID) {
        setErrorMessage("Bạn chưa đăng nhập.");
        return;
      }

      // API call to search for user by phone number
      const response = await axios.post("http://localhost:5000/api/search-friend-by-phone", {
        phoneNumber: phoneNumber,
        userID: userID, // Pass userID to the backend
      });

      if (response.status === 200) {
        const { friendStatus, ...userDetails } = response.data;
        setUserData(userDetails); // Set the user data
        setFriendStatus(friendStatus); // Set the friend status
        setErrorMessage(""); // Clear any previous error messages
        setIsSearchResultModalOpen(true); // Open the search result modal
      } else {
        setErrorMessage(response.data.message); // Handle any non-200 status code from the backend
      }
    } catch (error) {
      setErrorMessage(error.response ? error.response.data.message : "Không tìm thấy người dùng hoặc có lỗi xảy ra.");
    } finally {
      setIsLoading(false); // Set loading state to false when done
    }
  };

  const handleAddFriend = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/send-friend-request", {
        phoneNumber: phoneNumber,
        userID: userID, // Đảm bảo rằng userID là của người gửi yêu cầu
        name: userData.name, // Gửi tên của người gửi
        image: userData.image, // Gửi ảnh của người gửi
      });
  
      if (response.status === 200) {
        setFriendStatus("pending");
  
        // Emit sự kiện gửi yêu cầu kết bạn, đảm bảo gửi đúng thông tin của người gửi yêu cầu
        socket.emit("sendFriendRequest", {
          phoneNumber: phoneNumber, 
          userID: userID,  // Người gửi yêu cầu
          name: userData.name,  // Tên người gửi yêu cầu
          image: userData.image  // Ảnh đại diện của người gửi yêu cầu
        });
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
                  onChange={(e) => setPhoneNumber(e.target.value)} // Update phone number
                />
              </div>

              {errorMessage && <div className="error-message">{errorMessage}</div>} {/* Display error message */} 

              {/* Button to trigger search */}
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

      {/* Show InfoSearchModal if user data is found */}
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
