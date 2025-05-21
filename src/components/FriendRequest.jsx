import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/FriendRequest.css"; // Import CSS
import { FaUserFriends } from "react-icons/fa"; // Import icon from react-icons
import { io } from "socket.io-client"; // Import socket.io-client
import { use } from "react";

//const socket = io("https://cnm-service.onrender.com"); // Kết nối với server socket  http://localhost:5001
const socket = io("http://localhost:5000");
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
      setFriendRequests(friendRequests.receivedRequests); // Cập nhật danh sách yêu cầu kết bạn
      setFriendSend(friendRequests.sentRequests); // Cập nhật danh sách yêu cầu đã gửi
      setIsLoading(false);
    });

    socket.on('new_friend_request', (data) => {
      console.log("Yêu cầu kết bạn mới:", data);
      setFriendRequests((prevRequests) => [...prevRequests, data]); // Cập nhật danh sách yêu cầu kết bạn
    });
    socket.on('friend_request_sent', (data) => {
      setFriendSend((prevRequests) => [...prevRequests, data]); // Cập nhật danh sách yêu cầu đã gửi
      console.log("Yêu cầu kết bạn đã gửi:", data);
    });

    socket.on("friend_request_accepted", (data) => {
      if(data.status ==="accepted"){
        console.log("Yêu cầu kết bạn đã được chấp nhận:", data);
        setFriendRequests((prevRequests) => prevRequests.filter(req => req.contactID !== data.userID)); // Xóa yêu cầu đã chấp nhận
      }

    });
    socket.on("friend_request_accepted", (data) => {
      if (data.status === "accepted") {
        console.log("Yêu cầu kết bạn đã được chấp nhận:", data);
        setFriendSend((prevRequests) => prevRequests.filter(req => req.userID !== data.recipientID)); // Xóa yêu cầu đã chấp nhận
      }
    });
    socket.on("friend_request_recipientID", (data) => {
      if (data.status === "rejected") {
        console.log("Yêu cầu kết bạn đã bị từ chối:", data);
        setFriendRequests((prevRequests) => prevRequests.filter(req => req.contactID !== data.userID)); // Xóa yêu cầu đã từ chối
      }
    });
    socket.on("friend_request_senderID", (data) => {
      if (data.status === "rejected") {
        console.log("Yêu cầu kết bạn đã bị từ chối:", data);
        setFriendSend((prevRequests) => prevRequests.filter(req => req.userID !== data.recipientID)); // Xóa yêu cầu đã từ chối
      }
    });

    


    // Lắng nghe sự kiện lỗi
    socket.on("error", (error) => {
     // setErrorMessage(error.message || "Lỗi khi lấy yêu cầu kết bạn.");
      setIsLoading(false);
    });

    // Dọn dẹp sự kiện khi component unmount
    return () => {
      socket.off("pending_friend_requests");
      socket.off("new_friend_request");
      socket.off("friend_request_accepted");
      socket.off("friend_request_accepted");
      socket.off('friend_request_sent');
      socket.off("friend_request_recipientID");
      socket.off("friend_request_senderID");
      socket.off("error");
    };
  }, [user]); // Khi user thay đổi, gọi lại yêu cầu lấy yêu cầu kết bạn


  console.log("Friend Requests:", friendRequests); // Debugging line
  


  const handleAcceptRequest = async (item) => {
    socket.emit("accept_friend_request", {
      senderID: item.contactID,
      recipientID: user.userID,
      senderName: item.name,
      senderImage: item.avatar,
    });
  };

  // Handle reject friend request
  // const handleRejectRequest = async (item) => {
  //       socket.emit("reject_friend_request", {
  //         senderID: user.userID,// nguoi giui =contactID
  //         recipientID: item.userID, //nguoi nhan
  //         senderName: item.name,
  //         senderImage: item.avatar,
  //       });
  //       console.log("Rejecting friend request----:", {
  //         senderID: user.userID,
  //         recipientID: item.userID,
  //         senderName: item.name,
  //         senderImage: item.avatar,
  //       });
  //       console.log("Friend Requests after rejection:", item); // Debugging line
  // };
  // thu hoi
   const handleRejectRequestt = async (item) => {
        socket.emit("reject_friend_request", {
          senderID: item.contactID,
          recipientID: item.userID,
          senderName: item.name,
          senderImage: item.avatar,
        });
        console.log("Rejecting friend request----:", {
          senderID: item.contactID,
          recipientID: user.userID,
          senderName: item.name,
          senderImage: item.avatar,
        });
        console.log("Friend Requests after rejection:", item); // Debugging line
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
          <div key={request.name} className="friend-item">
            <img src={request?.avatar} alt="Avatar" />
            <div className="info">
              <h4>{request.name}</h4>
            </div>
            <div className="btn-group">
              <button
                className="accept-btn"
                onClick={() => handleAcceptRequest(request)} // Chuyển vào contactID đúng
              >
                Đồng ý
              </button>
              <button
                className="reject-btn"
                onClick={() => handleRejectRequestt(request)} // Chuyển vào contactID đúng
              >
                Từ chối
              </button>
            </div>
          </div>
        ))
      )}
      {/* Lời mời đã gửi */}
      <h3>
        <FaUserFriends className="icon" />
        Lời mời đã gửi
      </h3>
      <div>
        <span className="friend-count">Số lượng lời mời đã gửi: {friendSend.length}</span>
      </div>
      {friendSend.length === 0 ? (
        null
      ) : (
        friendSend.map((sentRequest) => (
          <div key={sentRequest.name} className="friend-item">
            <img src={sentRequest.avatar || "https://example.com/avatar.jpg"} alt="Avatar" />
            <div className="info">
              <h4>{sentRequest.name}</h4>
            </div>
            <div className="btn-group">
              <button
                className="reject-btn"
                onClick={() => handleRejectRequestt(sentRequest)}
              >
                Thu hồi
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default FriendRequest;
