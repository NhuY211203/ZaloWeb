import React, { useState, useEffect } from "react";
import * as FaIcons from "react-icons/fa";
import { io } from 'socket.io-client';

const socket = io('https://cnm-service.onrender.com');

// Hàm kiểm tra tính hợp lệ của số điện thoại
const isValidPhoneNumber = (phoneNumber) => {
  const phoneRegex = /^(0[35789][0-9]{8}|(\+84)[35789][0-9]{8})$/;
  return phoneRegex.test(phoneNumber);
};

// Hàm kiểm tra tính hợp lệ của email
const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

// Hàm kiểm tra tên: ít nhất 2 từ, mỗi từ bắt đầu chữ hoa, cho phép dấu tiếng Việt
const validateName = (name) => {
  const cleanName = name.trim().replace(/\s+/g, ' ');
  const nameRegex = /^([A-ZÀ-Ỵ][a-zà-ỹ]*)(\s[A-ZÀ-Ỵ][a-zà-ỹ]*)+$/;
  return nameRegex.test(cleanName);
};

// Hàm kiểm tra tính hợp lệ của ngày sinh và tuổi >= 18
const isValidDOB = (dob) => {
  const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dobRegex.test(dob)) return false;

  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age >= 18;
};

const UserProfileModal = ({ onClose, user, setUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [file, setFile] = useState(null);
  const [profile, setProfile] = useState({
    userID: '',
    name: '',
    email: '',
    avatar: '',
    anhbia: '',
    dobDay: '',
    dobMonth: '',
    dobYear: '',
    gender: '',
    phone: ''
  });

  useEffect(() => {
    if (user?.ngaysinh) {
      const dobParts = new Date(user.ngaysinh);
      setProfile({
        userID: user?.userID || "user001",
        name: user?.name || "Nguyen Thanh Quyen",
        email: user?.email || "user001@example.com",
        avatar: user?.anhDaiDien || "https://res.cloudinary.com/dgqppqcbd/image/upload/v1741595806/anh-dai-dien-hai-1_b33sa3.jpg",
        anhbia: user?.anhBia || "https://res.cloudinary.com/dgqppqcbd/image/upload/v1741595806/anh-dai-dien-hai-1_b33sa3.jpg",
        dobDay: dobParts.getDate() < 10 ? `0${dobParts.getDate()}` : `${dobParts.getDate()}`,
        dobMonth: dobParts.getMonth() + 1 < 10 ? `0${dobParts.getMonth() + 1}` : `${dobParts.getMonth() + 1}`,
        dobYear: `${dobParts.getFullYear()}`,
        gender: user?.gioTinh || "Nam",
        phone: user?.sdt || "0977654319",
      });
    }
  }, [user]);

  const generateDateOptions = (type) => {
    const options = [];
    if (type === "day") {
      for (let i = 1; i <= 31; i++) {
        const day = i < 10 ? `0${i}` : `${i}`;
        options.push(<option key={day} value={day}>{day}</option>);
      }
    }
    if (type === "month") {
      for (let i = 1; i <= 12; i++) {
        const month = i < 10 ? `0${i}` : `${i}`;
        options.push(<option key={month} value={month}>{month}</option>);
      }
    }
    if (type === "year") {
      const currentYear = new Date().getFullYear();
      for (let i = currentYear - 100; i <= currentYear; i++) {
        options.push(<option key={i} value={i}>{i}</option>);
      }
    }
    return options;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFile(file);
    const imageUrl = URL.createObjectURL(file);

    setProfile((prev) => ({
      ...prev,
      avatar: imageUrl,
    }));
  };

  const handleSave = async () => {
    if (!profile.userID || !profile.name || !profile.email || !profile.phone) {
      setErrorMessage("Thiếu thông tin cần thiết!");
      return;
    }

    if (!validateName(profile.name)) {
      setErrorMessage("Tên không hợp lệ! Ít nhất 2 từ, mỗi từ bắt đầu chữ hoa.");
      return;
    }

    if (!isValidPhoneNumber(profile.phone)) {
      setErrorMessage("Số điện thoại không hợp lệ!");
      return;
    }

    if (!isValidEmail(profile.email)) {
      setErrorMessage("Email không hợp lệ!");
      return;
    }

    // Chuyển sang chuỗi rồi padStart để tránh lỗi
    const dobDay = profile.dobDay ? String(profile.dobDay).padStart(2, "0") : "01";
    const dobMonth = profile.dobMonth ? String(profile.dobMonth).padStart(2, "0") : "01";
    const dobYear = profile.dobYear || new Date().getFullYear();

    const dob = `${dobYear}-${dobMonth}-${dobDay}`;

    if (!isValidDOB(dob)) {
      setErrorMessage("Ngày sinh không hợp lệ hoặc bạn chưa đủ 18 tuổi.");
      return;
    }

    let url = [];
    if (!file) {
      url.push(user?.anhDaiDien);
    } else {
      const imageForm = new FormData();
      imageForm.append("files", file);

      const res = await fetch("https://cnm-service.onrender.com/api/upload", {
        method: "POST",
        body: imageForm,
      });
      const data = await res.json();
      url.push(data.urls[0]);
    }

    const updateData = {
      name: profile.name,
      email: profile.email,
      sdt: profile.phone,
      ngaysinh: dob,
      gioTinh: profile.gender,
      anhDaiDien: url[0],
      anhBia: profile.anhbia,
    };

    try {
      const response = await fetch(`https://cnm-service.onrender.com/api/users/${profile.userID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      if (data.error) {
        setErrorMessage(data.error);
      } else {
        alert("Cập nhật thông tin thành công!");
        const dobParts = new Date(data.user?.ngaysinh);
        setProfile({
          userID: data.user?.userID,
          name: data.user?.name,
          email: data.user?.email,
          avatar: data.user?.anhDaiDien,
          anhbia: data.user?.anhBia,
          dobDay: dobParts.getDate() < 10 ? `0${dobParts.getDate()}` : `${dobParts.getDate()}`,
          dobMonth: dobParts.getMonth() + 1 < 10 ? `0${dobParts.getMonth() + 1}` : `${dobParts.getMonth() + 1}`,
          dobYear: `${dobParts.getFullYear()}`,
          gender: data.user?.gioTinh,
          phone: data.user?.sdt
        });
        sessionStorage.setItem("user", JSON.stringify(data.user));
        socket.emit("updateUser", data.user);
        setUser(data.user);
        setIsEditing(false);
        onClose();
      }
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu:", error);
      setErrorMessage("Lỗi hệ thống khi cập nhật thông tin.");
    }
  };

  return (
    <div className="modal-overlay profile-info-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Thông tin tài khoản</h2>
          <button onClick={onClose} className="close-btn">
            <FaIcons.FaTimes />
          </button>
        </div>
        <div className="modal-body profile-info">
          <div className="avatar-section">
            <img src={profile.avatar} alt="Avatar" className="avatar-img" />
            {isEditing && (
              <input
                type="file"
                name="avatar"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="edit-input"
                onChange={handleImageChange}
              />
            )}
          </div>
          <h3>{profile.name}</h3>
          <div className="info-section">
            <h4>Thông tin cá nhân</h4>
            {isEditing ? (
              <>
                <div className="input-group">
                  <label>Tên:</label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                </div>
                <div className="input-group">
                  <label>Email:</label>
                  <input
                    type="text"
                    name="email"
                    value={profile.email}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                </div>
                <div className="input-group">
                  <label>Ngày sinh:</label>
                  <div className="date-select">
                    <select
                      name="dobDay"
                      value={profile.dobDay || ""}
                      onChange={handleInputChange}
                      className="edit-input"
                    >
                      <option value="">Ngày</option>
                      {generateDateOptions("day")}
                    </select>
                    <select
                      name="dobMonth"
                      value={profile.dobMonth || ""}
                      onChange={handleInputChange}
                      className="edit-input"
                    >
                      <option value="">Tháng</option>
                      {generateDateOptions("month")}
                    </select>
                    <select
                      name="dobYear"
                      value={profile.dobYear || ""}
                      onChange={handleInputChange}
                      className="edit-input"
                    >
                      <option value="">Năm</option>
                      {generateDateOptions("year")}
                    </select>
                  </div>
                </div>
                <div className="input-group">
                  <label>Giới tính:</label>
                  <div>
                    <label>
                      <input
                        type="radio"
                        name="gender"
                        value="Nam"
                        checked={profile.gender === "Nam"}
                        onChange={handleInputChange}
                      />
                      Nam
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="gender"
                        value="Nữ"
                        checked={profile.gender === "Nữ"}
                        onChange={handleInputChange}
                      />
                      Nữ
                    </label>
                  </div>
                </div>
                <div className="input-group">
                  <label>Số điện thoại:</label>
                  <input
                    type="text"
                    name="phone"
                    value={profile.phone}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                </div>
              </>
            ) : (
              <>
                <p>Tên: {profile.name}</p>
                <p>Email: {profile.email}</p>
                <p>Ngày sinh: {profile.dobDay}-{profile.dobMonth}-{profile.dobYear}</p>
                <p>Giới tính: {profile.gender}</p>
                <p>Số điện thoại: {profile.phone}</p>
              </>
            )}
          </div>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          {isEditing ? (
            <div className="button-group">
              <button className="save-btn" onClick={handleSave}>
                Lưu
              </button>
              <button className="cancel-btn" onClick={() => setIsEditing(false)}>
                Hủy
              </button>
            </div>
          ) : (
            <button className="update-btn" onClick={() => setIsEditing(true)}>
              <FaIcons.FaPen className="update-icon" />
              Cập nhật
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
