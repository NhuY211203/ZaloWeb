// Profile.js
import React from 'react';

const Profile = ({ user }) => {
  return (
    <div className="profile">
      <h2>Thông tin cá nhân</h2>
      <p>Tên: {user?.name}</p>
      <p>Email: {user?.email}</p>
      <img src={user?.anhDaiDien} alt="Avatar" />
      {/* Hiển thị thêm các thông tin khác của người dùng */}
    </div>
  );
};

export default Profile;
