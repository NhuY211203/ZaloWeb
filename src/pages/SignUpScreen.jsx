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
    if (!sdt) {
      setError("Vui lòng nhập số điện thoại!");
      return;
    }

    try {
      // Kiểm tra số điện thoại đã đăng ký chưa
      const responseSDT = await axios.post(
        "https://cnm-service.onrender.com/api/users/checksdt",
        { sdt },
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("Kết quả kiểm tra số điện thoại:", responseSDT.data);

      if (responseSDT.data.exists) {
        setError("Số điện thoại đã được đăng ký!");
        alert("Số điện thoại đã được đăng ký!");
        return;
      } else {
        alert("Số điện thoại chưa được đăng ký, đang gửi xác thực về email...");
        await sendEmailVerification();
      }
    } catch (err) {
      setError("Lỗi kiểm tra số điện thoại: " + err.message);
      console.error(err);
    }
  };

  const sendEmailVerification = async () => {
    const actionCodeSettings = {
      url: "http://localhost:5173/verify-otp", // đổi thành URL ứng dụng của bạn
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
      setError("Lỗi khi gửi email xác thực!");
      console.error("Lỗi khi gửi email:", error);
    }
  };

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Số điện thoại Việt Nam 10 số bắt đầu 0, tiếp 9 số nữa
    const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;

    if (!sdt) {
      setError(""); // Không hiển thị lỗi khi chưa nhập sdt
      setEnabled(false);
    } else if (!phoneRegex.test(sdt)) {
      setError("Số điện thoại không hợp lệ!");
      setEnabled(false);
    } else if (!email) {
      setError(""); // Không hiển thị lỗi khi chưa nhập email
      setEnabled(false);
    } else if (!emailRegex.test(email)) {
      setError("Email không hợp lệ!");
      setEnabled(false);
    } else {
      setError(""); // Reset lỗi nếu đúng định dạng
      setEnabled(true); // Nếu tất cả hợp lệ
    }
  }, [sdt, email]);

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
          className="btn-primary"
          onClick={handleSignUp}
          disabled={!enabled}
        >
          Tiếp tục
        </button>

        <div className="flex justify-center mt-4">
          <p className="text-gray-500">Bạn đã có tài khoản? </p>
          <p className="text-blue-500 ml-1 cursor-pointer" onClick={handleLogin}>
            Đăng nhập
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpScreen;
 