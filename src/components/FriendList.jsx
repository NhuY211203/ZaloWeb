import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/FriendList.css"; // Import CSS
import { FaUserFriends } from "react-icons/fa"; // Import icon from react-icons

const FriendList = () => {
  const [friends, setFriends] = useState([]); // Store friends data
  const [friendCount, setFriendCount] = useState(0); // Store number of friends
  const [errorMessage, setErrorMessage] = useState(""); // Store error message state

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
          <div key={friend.userID} className="friend-itemm">
            <img
              src={friend.anhDaiDien || "https://example.com/default-avatar.jpg"} // Hiển thị ảnh đại diện
              alt="Avatar"
              className="friend-avatar"
            />
            <span>{friend.name}</span> {/* Hiển thị tên bạn bè */}
          </div>
        ))
      ) : (
        <p>Không có bạn bè nào.</p>
      )}
    </div>
  );
};

export default FriendList;
