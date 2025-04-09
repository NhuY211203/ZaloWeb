// pages/VerifyOtpDK.jsx
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import logo from "../assets/logo.png";

const VerifyOtpDK = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, sdt, data } = location.state || {};
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError("Vui lòng nhập mã OTP!");
      return;
    }

    try {
      // Gửi yêu cầu xác thực OTP và đăng ký tài khoản
      const response = await axios.post(
        "https://echoapp-rho.vercel.app/api/users/verify-otp-signup",
        { email, sdt, otp }
      );

      if (response.data.success) {
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        navigate("/login-password");
      } else {
        setError("Mã OTP không đúng. Vui lòng thử lại!");
      }
    } catch (err) {
      console.error("Lỗi khi xác thực OTP:", err.message);
      setError("Có lỗi xảy ra. Vui lòng thử lại!");
    }
  };

  return (
    <div className="layout-container">
      <img src={logo} alt="Echo Logo" className="w-32 h-32 mb-4" />
      <p className="text-gray-600 text-center mt-2">
        Xác thực đăng ký tài khoản Echo
      </p>

      <div className="container mt-4">
        <h2 className="text-lg font-bold mb-4">Nhập mã OTP</h2>
        <p className="text-gray-500 mb-2">
          Mã OTP đã được gửi đến email: {email}
        </p>
        <input
          type="text"
          placeholder="Nhập mã OTP"
          className="form-input"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        {error && <p className="text-red-500 text-center mt-2">{error}</p>}

        <button className="btn-primary" onClick={handleVerifyOtp}>
          Xác nhận
        </button>

        <p
          className="text-gray-500 text-center cursor-pointer mt-2"
          onClick={() => navigate("/signup")}
        >
          Quay lại
        </p>
      </div>
    </div>
  );
};

export default VerifyOtpDK;