import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/FriendList.css"; // Import CSS
import { FaUserFriends } from "react-icons/fa"; // Import icon from react-icons
import { useNavigate } from "react-router-dom";

const FriendList = () => {
  const [friends, setFriends] = useState([]); // Store friends data
  const [friendCount, setFriendCount] = useState(0); // Store number of friends
  const [errorMessage, setErrorMessage] = useState(""); // Store error message state
   const navigate = useNavigate();

  const user = JSON.parse(sessionStorage.getItem("user")); // Lấy thông tin người dùng từ sessionStorage

  useEffect(() => {
    // Fetch friends data when the component mounts
    const fetchFriends = async () => {
      try {
        if (!user.userID) {
          setErrorMessage("Bạn chưa đăng nhập.");
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/friends/${user.userID}`);

        
        if (response.status === 200) {
          setFriends(response.data); // Set the friends data
          setFriendCount(response.data.length); // Update the friend count
        }
      } catch (error) {
        setErrorMessage("Không thể tải danh sách bạn bè.");
      }
    };

    fetchFriends(); // Call the function to fetch friends data
  }, [user.userID]); // Re-run this effect when userID changes
  const fetchatListChatFriend = async (friend) => {
    console.log("aaaaaa",friend);
    try {
      const response = await fetch("http://localhost:5000/api/chats1-1ByUserID", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userID1: user.userID,
          userID2: friend.userID,
        }),
      });
  
      const chat = await response.json();
      
  
      if (response.ok && chat && chat.chatID) {
        // Nếu đã có chat, chuyển đến ChatScreen
        navigate('/home',{state: chat});
      } else {
        // Nếu chưa có, tạo chat mới
        const createResponse = await fetch("http://localhost:5000/api/createChat1-1", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userID1: user.userID,
            userID2: friend.userID,
          }),
        });
  
        const chat = await createResponse.json();
       
        console.log("📦 New chat response:", newChat);
        if (createResponse.ok && chat.chatID) {
          socket.emit("createChat1-1",chat);
           navigate('/home',{state: chat});
        } else {
          console.error("Không tạo được chat mới", newChat.message || newChat);
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
        <span className="friend-count">Số lượng bạn bè: {friendCount}</span>
      </div>

      {/* Display error message if there's any */}
      {errorMessage && <div className="error-message">{errorMessage}</div>}

      {/* Display the list of friends */}
      {friends.length > 0 ? (
        friends.map((friend) => (
          <button onClick={fetchatListChatFriend(friend)}>
          <div key={friend.userID} className="friend-itemm">
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
