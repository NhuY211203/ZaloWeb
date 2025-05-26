import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import logo from "../assets/logo.png";
import { io } from "socket.io-client";

const socket = io("https://cnm-service.onrender.com");

// Bắt đầu 03, 05, 07, 08, 09 và có 10 chữ số
const isValidPhoneNumber = (phoneNumber) => {
  const phoneRegex = /^(0[3,5,7,8,9])[0-9]{8}$/;
  return phoneRegex.test(phoneNumber);
};

// Kiểm tra mật khẩu (tối thiểu 8 ký tự, phải có ít nhất 1 chữ cái và 1 chữ số)
const isValidPassword = (password) => {
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;  // ít nhất 1 chữ cái, 1 số, và 8 ký tự
  return passwordRegex.test(password);
};

const LoginPassword = () => {
  const navigate = useNavigate();
  const [sdt, setSDT] = useState("");
  const [matKhau, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault(); // Ngăn reload trang
    setError(null); // Reset lỗi trước khi kiểm tra
  
    // Kiểm tra tính hợp lệ của số điện thoại và mật khẩu
    if (!isValidPhoneNumber(sdt)) {
      setError("Số điện thoại không hợp lệ! (Bắt đầu 03, 05, 07, 08, 09 và có 10 chữ số)");
      return;
    }
  
    if (!isValidPassword(matKhau)) {
      setError("Mật khẩu không hợp lệ! (Tối thiểu 8 ký tự, bao gồm cả chữ cái và chữ số)");
      return;
    }
  
    try {
      const response = await axios.post("https://cnm-service.onrender.com/api/login", {
        sdt,
        matKhau,
      });

      alert("Đăng nhập thành công!");
      const res = await axios.post("https://cnm-service.onrender.com/api/updateStatus", {
        userID: response.data.user.userID,
        trangThai:"online"
      });
      console.log("Đăng nhập thành công!", res.data.user);
      sessionStorage.setItem("userID", res.data.user.userID); // Lưu userID vào sessionStorage
      sessionStorage.setItem("user", JSON.stringify(res.data.user)); // Lưu thông tin người dùng
      socket.emit("updateStatus", res.data.user); // Gửi sự kiện đến server để cập nhật trạng thái
      navigate("/home", { state: { user: res.data.user } }); // Chuyển hướng đến trang chính sau khi đăng nhập thành công
    } catch (err) {
      console.error("Lỗi đăng nhập:", err.message);
      setError("Sai số điện thoại hoặc mật khẩu");
    }
  };
  

  return (
    <div className="layout-container">
      <img src={logo} alt="Echo Logo" className="w-32 h-32 mb-4" />
      <p className="text-gray-600 text-center mt-2">Đăng nhập tài khoản Echo để kết nối với Echo Web</p>

      <div className="container mt-4">
        <h2 className="text-lg font-bold mb-4">Đăng nhập với mật khẩu</h2>
        <input
          type="text"
          placeholder="Số điện thoại"
          className="form-input"
          value={sdt}
          onChange={(e) => setSDT(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          className="form-input"
          value={matKhau}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        {/* Hiển thị thông báo lỗi */}
        {error && <p className="text-red-500 text-center mt-2">{error}</p>} {/* Hiển thị thông báo lỗi */}

        <button className="btn-primary" onClick={handleLogin}>Đăng nhập với mật khẩu</button>
        <p className="text-blue-500 mt-4 text-center cursor-pointer" onClick={() => navigate("/forgot-password")}>Quên mật khẩu</p>
        <p className="text-gray-500 text-center cursor-pointer mt-2" onClick={() => navigate("/")}>Đăng nhập qua mã QR</p>
      </div>
    </div>
  );
};

export default LoginPassword;