import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/FriendRequest.css"; // Import CSS
import { FaUserFriends } from "react-icons/fa"; // Import icon from react-icons
import socketIOClient from "socket.io-client"; // Import socket.io-client

const FriendRequest = ({ user }) => {
  const [friendRequests, setFriendRequests] = useState([]); // Ensure it's an array
  const [errorMessage, setErrorMessage] = useState(""); // For error handling
  const [isLoading, setIsLoading] = useState(false);

  const socket = socketIOClient("http://localhost:5000"); // Kết nối đến server
  
  useEffect(() => {
    // Lắng nghe sự kiện mới của yêu cầu kết bạn từ socket
    socket.on("newFriendRequest", (data) => {
      console.log("Received new friend request:", data);
      // Cập nhật danh sách yêu cầu kết bạn với thông tin của người gửi
      setFriendRequests((prevRequests) => [
        ...prevRequests,
        { name: data.name, userID: data.userID, phoneNumber: data.phoneNumber, image: data.image }
      ]);
    });
  
    return () => {
      socket.off("newFriendRequest"); // Hủy lắng nghe khi component unmount
    };
  }, []);
  

  // Hàm gọi lại API để lấy danh sách yêu cầu kết bạn
  const fetchFriendRequests = async () => {
    try {
      if (!user.userID) {
        setErrorMessage("Bạn chưa đăng nhập.");
        return;
      }

      // Gọi API lấy danh sách yêu cầu kết bạn
      const response = await axios.get(`http://localhost:5000/api/display-friend-request/${user.userID}`);

      if (Array.isArray(response.data)) {
        setFriendRequests(response.data);
      } else {
        setFriendRequests([]); // Reset khi không có dữ liệu hợp lệ
      }
    } catch (error) {
      console.error("Error fetching friend requests:", error);
      setErrorMessage("Không thể tải yêu cầu kết bạn.");
    }
  };

  // Khi component mount, fetch danh sách yêu cầu kết bạn
  useEffect(() => {
    fetchFriendRequests();
  }, [user.userID]); // Gọi lại mỗi khi userID thay đổi

  // Handle accept friend request
  const handleAcceptRequest = async (contactID) => {
    try {
      const response = await axios.post("http://localhost:5000/api/accept-friend-request", {
        contactID: contactID,  // ID của người gửi yêu cầu kết bạn
        userID: user.userID    // ID của người nhận yêu cầu (người đăng nhập)
      });
  
      if (response.status === 200) {
        // Gọi lại API để lấy danh sách yêu cầu kết bạn mới
        fetchFriendRequests();  // Gọi lại API để lấy dữ liệu mới
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
      alert("Có lỗi xảy ra khi chấp nhận yêu cầu.");
    }
  };
  
  

  // Handle reject friend request
  const handleRejectRequest = async (contactID) => {
    try {
      const response = await axios.post("http://localhost:5000/api/reject-friend-request", {
        contactID: contactID,  // ID của người gửi yêu cầu kết bạn
        userID: user.userID    // ID của người nhận yêu cầu (người đăng nhập)
      });
  
      if (response.status === 200) {
        // Cập nhật lại danh sách yêu cầu kết bạn hoặc danh sách bạn bè
        fetchFriendRequests();  // Gọi lại API để lấy dữ liệu mới
      }
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      alert("Có lỗi xảy ra khi từ chối yêu cầu.");
    }
  };
  
  return (
    <div className="friend-request-container">
      <h3>
        <FaUserFriends className="icon" />
        Lời mời kết bạn
      </h3>
      <div>
        <span className="friend-count">Lời mời đã nhận: {friendRequests.length}</span>
      </div>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {friendRequests.length === 0 ? (
        <p>Chưa có lời mời kết bạn nào.</p>
      ) : (
        friendRequests.map((request) => (
          <div key={request.contactID} className="friend-item">
            <img src={request.avatar || "https://example.com/avatar.jpg"} alt="Avatar" />
            <div className="info">
              <h4>{request.name}</h4>
            </div>
            <div className="btn-group">
              <button
                className="accept-btn"
                onClick={() => handleAcceptRequest(request.contactID)} // Chuyển vào contactID đúng
              >
                Đồng ý
              </button>
              <button
                className="reject-btn"
                onClick={() => handleRejectRequest(request.contactID)} // Chuyển vào contactID đúng
              >
                Từ chối
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default FriendRequest;
