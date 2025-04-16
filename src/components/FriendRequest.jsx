import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/FriendRequest.css"; // Import CSS
import { FaUserFriends } from "react-icons/fa"; // Import icon from react-icons
import { io } from "socket.io-client"; // Import socket.io-client

const socket = io("http://localhost:5000"); // Kết nối với server socket

const FriendRequest = ({ user }) => {
  const [friendRequests, setFriendRequests] = useState([]); // Ensure it's an array
  const [errorMessage, setErrorMessage] = useState(""); // For error handling
  const [friendSend, setFriendSend] = useState([]); // For friend send requests
  const [isLoading, setIsLoading] = useState(false);

  
  
  useEffect(() => {
    if (!user) {
      setErrorMessage("Bạn chưa đăng nhập.");
      return;
    }
    
    // Đăng ký số điện thoại của người dùng khi kết nối socket
      socket.emit("join_user", user.userID);
    // Gửi yêu cầu lấy danh sách yêu cầu kết bạn từ server qua socket
    socket.emit("get_pending_friend_requests", user.userID);

    // Lắng nghe sự kiện "pending_friend_requests" để cập nhật danh sách yêu cầu kết bạn
    socket.on("pending_friend_requests", (friendRequests) => {
      setFriendRequests(friendRequests); // Cập nhật danh sách yêu cầu kết bạn
      setIsLoading(false);
    });

    socket.on('new_friend_request', (data) => {
      console.log("Yêu cầu kết bạn mới:", data);
      setFriendRequests((prevRequests) => [...prevRequests, data]); // Cập nhật danh sách yêu cầu kết bạn
    });

    // Lắng nghe sự kiện lỗi
    socket.on("error", (error) => {
      setErrorMessage(error.message || "Lỗi khi lấy yêu cầu kết bạn.");
      setIsLoading(false);
    });

    // Dọn dẹp sự kiện khi component unmount
    return () => {
      socket.off("pending_friend_requests");
      socket.off("new_friend_request");
      socket.off("error");
    };
  }, [user]); // Khi user thay đổi, gọi lại yêu cầu lấy yêu cầu kết bạn


  console.log("Friend Requests:", friendRequests); // Debugging line
  


  const handleAcceptRequest = async (contactID) => {
    try {
      const response = await axios.post("http://localhost:5000/api/accept-friend-request", {
        contactID: contactID,  // ID của người gửi yêu cầu kết bạn
        userID: user.userID    // ID của người nhận yêu cầu (người đăng nhập)
      });

      if (response.status === 200) {
        // Cập nhật lại danh sách yêu cầu kết bạn hoặc danh sách bạn bè
        //fetchFriendRequests();  // Gọi lại API để lấy dữ liệu mới

        // Gửi thông báo về việc chấp nhận yêu cầu qua socket
        socket.emit("accept_friend_request", {
          senderID: contactID,
          recipientID: user.userID,
        });
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
        //fetchFriendRequests();  // Gọi lại API để lấy dữ liệu mới
        setFriendRequests((prevRequests) => prevRequests.filter((req) => req.contactID !== contactID));
        // Gửi thông báo về việc từ chối yêu cầu qua socket
        socket.emit("reject_friend_request", {
          senderID: contactID,
          recipientID: user.userID,
        });
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
      {<p>Chưa giửi lời mời.</p>}
    </div>
  );
};

export default FriendRequest;
