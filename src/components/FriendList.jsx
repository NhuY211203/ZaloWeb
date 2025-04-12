import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/FriendList.css"; // Import CSS
import { FaUserFriends } from "react-icons/fa"; // Import icon from react-icons

const FriendList = ({user}) => {
  const [friends, setFriends] = useState([]); // Store friends data
  const [friendCount, setFriendCount] = useState(0); // Store number of friends
  const [errorMessage, setErrorMessage] = useState(""); // Store error message state

  const userID = localStorage.getItem("userID"); // Get userID from localStorage

  useEffect(() => {
    // Fetch friends data when the component mounts
    const fetchFriends = async () => {
      try {
        if (!user.userID) {
          setErrorMessage("Bạn chưa đăng nhập.");
          return;
        }

        const response = await axios.get(`https://echoapp-rho.vercel.app/api/friends/${user.userID}`);
        
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
      {friends.map((friend) => {
        return <div key={friend.userID} className="friend-item">
          <span>{friend.alias}</span></div>;
      })}

      {/* If no friends, show a message */}
      {friends.length === 0 && !errorMessage && <p>Không có bạn bè nào.</p>}
    </div>
  );
};

export default FriendList;
