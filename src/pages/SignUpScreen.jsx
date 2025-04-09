// pages/SignUpScreen.jsx
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import logo from "../assets/logo.png";
import { authentication } from "../config/firebase";
import { sendSignInLinkToEmail } from "firebase/auth";

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
      // Kiểm tra email
      const responseSDT = await axios.post('https://echoapp-rho.vercel.app/api/users/checksdt', 
        { sdt },
        { headers: { 'Content-Type': 'application/json' } }
      ).catch(err => {
        throw new Error(`Lỗi kiểm tra email: ${err.message}`);
      });
      console.log("Kết quả kiểm tra số điện thoại:");
      console.log("Kết quả kiểm tra số điện thoại:", responseSDT.data);

      if (responseSDT.data.exists) {
        console.log("Số điện thoại đã được đăng ký!");
        return;
      } else {
        console.log("Đã gửi xác thực về gmail!");
        await sendEmailVerification();
      }
  };
const sendEmailVerification = async () => {
    const actionCodeSettings = {
      url: "http://localhost:5173/verify-otp", // Đổi thành URL ứng dụng của bạn
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(authentication, email, actionCodeSettings);
      console.log("Email xác thực đã gửi!");
      window.localStorage.setItem("emailForSignIn", email);
      window.localStorage.setItem("sdt", sdt); 
      // Đóng trang sau 2 giây
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      setErrorMessage("Lỗi khi gửi email xác thực!");
      console.error("Lỗi khi gửi email:", error);
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
