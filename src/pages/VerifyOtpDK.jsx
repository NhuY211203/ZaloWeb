// pages/VerifyOtpDK.jsx
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import logo from "../assets/logo.png";

const VerifyOtpDK = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, sdt, name, birth, password, gender, data } = location.state || {};
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError("Vui lòng nhập mã OTP!");
      return;
    }

    try {
      // Gửi yêu cầu xác thực OTP
      const otpResponse = await axios.post(
        "https://echoapp-rho.vercel.app/api/users/verify-otp-signup",
        { email, sdt, otp }
      );

      if (!otpResponse.data.success) {
        setError("Mã OTP không đúng. Vui lòng thử lại!");
        return;
      }

      // Nếu OTP hợp lệ, gọi API đăng ký
      const registerResponse = await axios.post(
        "https://echoapp-rho.vercel.app/api/users/register",
        { sdt, name, birth, password, email, gender }
      );

      if (registerResponse.data.success) {
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        navigate("/login-password");
      } else {
        setError("Đăng ký không thành công. Vui lòng thử lại!");
      }
    } catch (err) {
      console.error("Lỗi khi xác thực OTP hoặc đăng ký:", err.message);
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
          className="text-gray-500 text-center cursor-pointer mt-2 hover:text-gray-700 transition-colors"
          onClick={() => navigate("/signup-info", { state: { email, sdt } })}
        >
          Quay lại
        </p>
      </div>
    </div>
  );
};

export default VerifyOtpDK;
