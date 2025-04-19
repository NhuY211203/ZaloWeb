import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/FriendList.css"; // Import CSS
import { FaUserFriends } from "react-icons/fa"; // Import icon from react-icons
import { useNavigate } from "react-router-dom";
import { io } from 'socket.io-client';
const socket = io('http://localhost:5000');


const FriendList = ({friends,onStartChat,user}) => {
  const [errorMessage, setErrorMessage] = useState(""); // Store error message state
   const navigate = useNavigate();
   console.log("friends",friends.length);
   useEffect(() => {
    if (!user?.userID) return;
    socket.emit("join_user", user.userID);
  }, []);

 // const user = JSON.parse(sessionStorage.getItem("user")); // Lấy thông tin người dùng từ sessionStorage


  const fetchatListChatFriend = async (friend) => {
    try {
      const response = await fetch("http://localhost:5000/api/chats1-1ByUserID", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userID1: user.userID,
          userID2: friend.userID,
        }),
      });
  
      const chat = await response.json();
  
      if (response.ok && chat && chat.chatID) {
        onStartChat(chat);
      } else {
        const createResponse = await fetch("http://localhost:5000/api/createChat1-1", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userID1: user.userID,
            userID2: friend.userID,
          }),
        });
  
        const newchat = await createResponse.json();
  
        console.log("📦 New chat response:", newchat);
        if (createResponse.ok && newchat.chatID) {
          socket.emit("createChat1-1", newchat);
          onStartChat(newchat);
        } else {
          console.error("Không tạo được chat mới", newchat.message || newchat);
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy/tạo chat:", error);
    }
  };
  

  return (
    <div className="content-section">
      <h3>
        <FaUserFriends className="icon" />
        Danh sách bạn bè
      </h3>
      <div>
        <span className="friend-count">Số lượng bạn bè: {friends.length}</span>
      </div>

      {/* Display error message if there's any */}
      {errorMessage && <div className="error-message">{errorMessage}</div>}

      {/* Display the list of friends */}
      {friends.length > 0 ? (
        friends.map((friend) => (
          <button key={friend._id} onClick={() => fetchatListChatFriend(friend)}>
          <div  className="friend-itemm">
            <img
              src={friend.anhDaiDien || "https://example.com/default-avatar.jpg"} // Hiển thị ảnh đại diện
              alt="Avatar"
              className="friend-avatar"
            />
            <span>{friend.name}</span> {/* Hiển thị tên bạn bè */}
          </div>
          </button>
        ))
      ) : (
        <p>Không có bạn bè nào.</p>
      )}
    </div>
  );
};

export default FriendList;
