import React, { useState, useEffect } from "react";
import axios from "axios"; // For making HTTP requests
import "../styles/FriendRequest.css"; // Import CSS
import { FaUserFriends } from "react-icons/fa"; // Import icon from react-icons

const FriendRequest = ({user}) => {
  const [friendRequests, setFriendRequests] = useState([]); // Ensure it's an array
  const [errorMessage, setErrorMessage] = useState(""); // For error handling
  useEffect(() => {
    console.log("Abc",user); // Log when the component mounts
  }, [user]); // Empty dependency array to run only once when the component mounts

  // Fetch friend requests when the component mounts
  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {

        if (!user.userID) {
          setErrorMessage("Bạn chưa đăng nhập.");
          return; // Exit if no userID
        }

        // Fetch the received pending friend requests from the API
        const response = await axios.get(`https://echoapp-rho.vercel.app/api/display-friend-request/${user.userID}`);

        // Ensure the response data is an array before setting it
        if (Array.isArray(response.data)) {
          setFriendRequests(response.data);
        } else {
          // setErrorMessage("Dữ liệu không hợp lệ.");
          setFriendRequests([]); // Reset to an empty array if data is invalid
        }
      } catch (error) {
        console.error("Error fetching friend requests:", error);
        setErrorMessage("Không thể tải yêu cầu kết bạn.");
      }
    };

    fetchFriendRequests();
  }, []); // Empty dependency array to run only once when the component mounts

  // Handle accept friend request
  const handleAcceptRequest = async (contactID) => {
    try {

      const response = await axios.post("https://echoapp-rho.vercel.app/api/accept-friend-request", {
        contactID: contactID  // Truyền contactID hợp lệ
      });

      if (response.status === 200) {
        // Update UI by removing the accepted request
        alert("Yêu cầu kết bạn đã được chấp nhận!");
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
      alert("Có lỗi xảy ra khi chấp nhận lời mời.");
    }
  };
  

  // Handle reject friend request
  const handleRejectRequest = async (contactID) => {
    try {

      const response = await axios.post("https://echoapp-rho.vercel.app/api/reject-friend-request", {
        userID: user.userID,  // Truyền userID hợp lệ
        contactID: contactID  // Truyền contactID hợp lệ
      });

      
      
      if (response.status === 200) {
        // Update UI by removing the rejected request
        setFriendRequests(friendRequests.filter((req) => req.contactID !== contactID));
        alert("Yêu cầu kết bạn đã bị từ chối!");
      }
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      alert("Có lỗi xảy ra khi từ chối lời mời.");
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
                onClick={() => handleAcceptRequest(user.userID)}
              >
                Đồng ý
              </button>
              <button
                className="reject-btn"
                onClick={() => handleRejectRequest(user.userID)}
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
