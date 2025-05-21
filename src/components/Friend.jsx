import React, { useState, useEffect } from "react";
import "../styles/Friend.css"; // Import CSS cho modal
import { FaUserFriends, FaUsers, FaUserPlus } from "react-icons/fa"; // Import icon từ react-icons
import SearchBar from "../components/SearchBar";
import FriendList from "./FriendList";
import GroupList from "./GroupList";
import FriendRequest from "./FriendRequest";
import { io } from 'socket.io-client';
const socket = io('https://cnm-service.onrender.com');

const Friend = ({onStartChat,user}) => {
  const [friends, setFriends] = useState([]); // Store friends data
  useEffect(() => {
      // Fetch friends data ngay sau khi setUser xong
      const fetchFriends = async () => {
        try {
          const response = await fetch("https://cnm-service.onrender.com/api/ContacsFriendByUserID", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userID: user.userID }),
          });
          
          const data = await response.json();
          console.log("📦 Server response:", data);
          setFriends(data); // Set the friends data
        } catch (error) {
          setErrorMessage("Không thể tải danh sách bạn bè.");
        }
      };
      fetchFriends();
  }, []);
  useEffect(() => {
    if (!user?.userID) return;
    socket.emit("join_user", user.userID);
    socket.on("friend_request_accepted", (data) => {
      if(data.status ==="accepted"){
        console.log("friend_request_accepted",data);
        setFriends((prevRequests) =>[...prevRequests,data]); // Xóa yêu cầu đã chấp nhận
      }
    });
     socket.on("update_user", (updatedUser) => {
  setFriends((prevRequests) =>
    prevRequests.map((res) => {
      if (res.userID === updatedUser.userID) {
        return {
          ...res,
          name: updatedUser.name,
          anhDaiDien: updatedUser.anhDaiDien,
          sdt: updatedUser.sdt,
          trangThai: updatedUser.trangThai,
        };
      }
      return res;
    })
  );
});

    return () => {
      socket.off("friend_request_accepted");
      socket.off("update_user");
    }

  }, [user.userID]);
  
  console.log("friends", friends);
  

  // Trạng thái để quản lý view hiện tại
  const [activeView, setActiveView] = useState("friends");

  // Hàm xử lý khi nhấn vào từng button
  const handleViewChange = (view) => {
    setActiveView(view); // Cập nhật view khi nhấn vào nút
  };

  if (!user) {
    return <div>Loading...</div>; // Nếu chưa có thông tin người dùng thì hiển thị "Loading..."
  }

  console.log("user-----", user);

  return (
    <div className="profile-container">
      <div className="button-group">
        <SearchBar
           user={user}
        />
        <button
          className={`btn ${activeView === "friends" ? "active" : ""}`}
          onClick={() => handleViewChange("friends")}

        >
          <FaUserFriends className="icon" />
          Danh sách bạn bè
        </button>

        <button
          className={`btn ${activeView === "groups" ? "active" : ""}`}
          onClick={() => handleViewChange("groups")}
        >
          <FaUsers className="icon" />
          Danh sách nhóm
        </button>

        <button
          className={`btn ${activeView === "invites" ? "active" : ""}`}
          onClick={() => handleViewChange("invites")}
        >
          <FaUserPlus className="icon" />
          Lời mời kết bạn
        </button>
      </div>

      {/* Nội dung hiển thị bên cạnh */}
      <div className="content-container">
        {activeView === "friends" && <FriendList user={user} friends={friends} onStartChat={onStartChat} />}
        {activeView === "groups" && <GroupList user={user} />}
        {activeView === "invites" && <FriendRequest user={user} />}
      </div>
    </div>
  );
};

export default Friend;
