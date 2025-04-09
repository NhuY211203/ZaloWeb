// pages/SignUpScreen.jsx
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import logo from "../assets/logo.png";

const SignUpScreen = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sdt, setSDT] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = () => {
    navigate("/login-password");
  };

  const handleSignUp = async () => {
    if (!email) {
      setError("Vui lòng nhập email!");
      return;
    }

    try {
      // Kiểm tra email và số điện thoại đã tồn tại chưa
      const checkEmailResponse = await axios.get(
        `https://echoapp-rho.vercel.app/api/users/check-email?email=${email}`
      );
      const checkSDTResponse = await axios.get(
        `https://echoapp-rho.vercel.app/api/users/check-sdt?sdt=${sdt}`
      );

      if (checkEmailResponse.data.exists || checkSDTResponse.data.exists) {
        setError("Email hoặc Số điện thoại đã tồn tại!");
        return;
      }

      // Chuyển đến màn hình nhập thông tin bổ sung (SignUpInfoScreen)
      navigate("/signup-info", {
        state: { email, sdt },
      });
    } catch (err) {
      console.error("Lỗi khi đăng ký:", err.message);
      setError("Có lỗi xảy ra. Vui lòng thử lại!");
    }
  };

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(0[3,5,7,8,9])[0-9]{8}$/;

    if (emailRegex.test(email) && phoneRegex.test(sdt)) {
      setEnabled(true);
    } else {
      setEnabled(false);
    }
  }, [email, sdt]);

  return (
    <div className="layout-container">
      <img src={logo} alt="Echo Logo" className="w-32 h-32 mb-4" />
      <p className="text-gray-600 text-center mt-2">Đăng ký tài khoản Echo</p>

      <div className="container mt-4">
        <h2 className="text-lg font-bold mb-4">Đăng ký</h2>
        <input
          type="text"
          placeholder="Số điện thoại"
          className="form-input"
          value={sdt}
          onChange={(e) => setSDT(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="form-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {error && <p className="text-red-500 text-center mt-2">{error}</p>}

        <button
          className={`btn-primary ${!enabled ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={handleSignUp}
          disabled={!enabled}
        >
          Tiếp tục
        </button>

        <div className="flex justify-center mt-4">
          <p className="text-gray-500">Bạn đã có tài khoản? </p>
          <p
            className="text-blue-500 ml-1 cursor-pointer"
            onClick={handleLogin}
          >
            Đăng nhập
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpScreen;
