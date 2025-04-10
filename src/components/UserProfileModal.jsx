import * as FaIcons from "react-icons/fa";
import React, { useState,useEffect } from "react";
const UserProfileModal = ({ onClose,user }) => {
    console.log(user)
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState('');
    const [fileupload, setFileUpload] = useState(null);
    const isValidPhoneNumber = (phoneNumber) => {
      const phoneRegex = /^(0[3|5|7|8|9][0-9]{8}|(\+84)[3|5|7|8|9][0-9]{8})$/;
      return phoneRegex.test(phoneNumber);
    };
    // Kiểm tra tính hợp lệ của email
    const isValidEmail = (email) => {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(email);
    };
    
    // Kiểm tra tính hợp lệ của ngày sinh (định dạng dd-mm-yyyy hoặc dd/mm/yyyy)
    const isValidDOB = (dob) => {
      const dobRegex = /^(0[1-9]|[12][0-9]|3[01])[-/](0[1-9]|1[0-2])[-/]\d{4}$/;
      return dobRegex.test(dob);
    };
    
    // Kiểm tra tính hợp lệ của mật khẩu (tối thiểu 8 ký tự, phải có ít nhất 1 chữ cái và 1 chữ số)
    const isValidPassword = (password) => {
      const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
      return passwordRegex.test(password);
    };
    
    // Kiểm tra tính hợp lệ của URL (ảnh đại diện)
    const isValidImageURL = (url) => {
      const imageRegex = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|bmp|svg))$/i;
      return imageRegex.test(url);
    };
    useEffect(() => {
      setProfile({
        userID: user?.userID || "user001",
        name: user?.name || "Nguyen Thanh Quyen",
        email: user?.email || "user001@example.com",
        avatar: user?.anhDaiDien || "https://res.cloudinary.com/dgqppqcbd/image/upload/v1741595806/anh-dai-dien-hai-1_b33sa3.jpg",
        dob: user?.ngaySinh || "22-05-1998",
        gender: user?.gioTinh || "Nam",
        phone: user?.sdt || "0977654319",
        password: user?.matKhau || "Password123"
      });
    }, [user]);
    
    const [errorMessage, setErrorMessage] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false); // Điều khiển hiển thị mật khẩu
    
    const handleEditToggle = () => {
      setIsEditing(!isEditing);
    };
  
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setProfile((prev) => ({
        ...prev,
        [name]: value,
      }));
    };
  
    // utils/uploadToCloudinary.js
   const uploadToCloudinary = async (file) => {
    try {
      const formData = new FormData();
      formData.append("image", file); // "image" phải đúng với `upload.single("image")`
  
      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error("Upload ảnh thất bại");
      }
  
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("❌ Upload error:", error);
      return null;
    }
  };
  
    const handleImageChange = async(e) => {
      const file = e.target.files[0];
      if (file) {
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          alert('Chỉ cho phép ảnh định dạng PNG, JPEG, JPG hoặc WEBP');
          return;
        }
        setFileUpload(file);
  
      }
    };
    const uploadImage = async () => {
      const url = await uploadToCloudinary(fileupload);
      console.log(url);
    }
  
  
    const handleSave = async () => {
      // // Kiểm tra tính hợp lệ của thông tin
      // if (!profile.userID || !profile.name || !profile.email || !profile.sdt) {
      //   setErrorMessage("Thiếu thông tin cần thiết!");
      //   return;
      // }
    
      if (!isValidEmail(profile.email)) {
        setErrorMessage("Email không hợp lệ!");
        return;
      }
    
      if (!isValidPhoneNumber(profile.phone)) {
        setErrorMessage("Số điện thoại không hợp lệ!");
        return;
      }
    
      if (!isValidDOB(profile.dob)) {
        setErrorMessage("Ngày sinh không hợp lệ! Vui lòng nhập đúng định dạng dd-mm-yyyy.");
        return;
      }
    
      if (!isValidPassword(profile.password)) {
        setErrorMessage("Mật khẩu không hợp lệ! (Tối thiểu 8 ký tự, bao gồm chữ cái và chữ số)");
        return;
      }
    
      if (!isValidImageURL(profile.avatar) && !profile.avatar.startsWith("data:image")) {
        setErrorMessage("URL ảnh đại diện không hợp lệ!");
        return;
      }
    
      // Kiểm tra xem người dùng có thay đổi ảnh đại diện hay không
      let avatarUrl = profile.avatar;
      if (fileupload) {
        avatarUrl = await uploadToCloudinary(fileupload); // Chỉ thay đổi ảnh nếu có ảnh mới
        if (!avatarUrl) {
          setErrorMessage("Lỗi khi tải ảnh lên!");
          return;
        }
      }
    
      // Cập nhật profile mà không mã hóa mật khẩu trong frontend
      const updatedProfile = { ...profile };
      // const updatedProfile = { ...profile, avatar: avatarUrl };
    
      // Gửi dữ liệu cập nhật lên API
      await updateUserProfile(updatedProfile);
    };
    
    
    
    const updateUserProfile = async (profile) => {
      try {
        // Gửi yêu cầu PUT lên backend để cập nhật thông tin người dùng
        const response = await fetch("https://echoapp-rho.vercel.app/api/update-user", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(profile), // Gửi profile đã được cập nhật
        });
    
        // Chờ phản hồi từ server
        const data = await response.json();
        console.log("Response data:", data); // Debugging response
    
        // Kiểm tra phản hồi từ server
        if (data.message === "Cập nhật thông tin thành công!") {
          alert("Cập nhật thông tin thành công!");
        } else {
          setErrorMessage(data.message); // Nếu có lỗi từ backend, hiển thị thông báo lỗi
        }
      } catch (error) {
        console.error("Lỗi khi cập nhật thông tin người dùng:", error);
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
              <div className="file-upload">
                {isEditing && (
                  <input
                    type="file"
                    name="avatar"
                     accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleImageChange}
                    className="edit-input"
                  />
                )}
              </div>
            </div>
            <h3>{profile.name}</h3>
          {/* <div className="avatar large">
          </div> */}
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
                    <input
                      type="text"
                      name="dob"
                      value={profile.dob}
                      onChange={handleInputChange}
                      className="edit-input"
                      placeholder="dd-mm-yyyy"
                    />
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
                  <div className="input-group">
                    <label>Mật khẩu:</label>
                    <div className="password-input-container">
                      <input
                        type={passwordVisible ? "text" : "password"}
                        name="password"
                        value={profile.password}
                        onChange={handleInputChange}
                        className="edit-input"
                      />
                      <button
                        type="button"
                        className="toggle-password-btn"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                      >
                        {passwordVisible ? <FaIcons.FaEyeSlash /> : <FaIcons.FaEye />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p>Tên: {profile.name}</p>
                  <p>Email: {profile.email}</p>
                  <p>Ngày sinh: {profile.dob}</p>
                  <p>Giới tính: {profile.gender}</p>
                  <p>Số điện thoại: {profile.phone}</p>
                </>
              )}
            </div>
  
            {/* Hiển thị thông báo lỗi */}
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
  
            {isEditing ? (
              <div className="button-group">
                <button className="save-btn" onClick={handleSave}>
                  Lưu
                </button>
                <button className="cancel-btn" onClick={handleEditToggle}>
                  Hủy
                </button>
              </div>
            ) : (
              <button className="update-btn" onClick={()=>{handleEditToggle();
                uploadImage()}}> 
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