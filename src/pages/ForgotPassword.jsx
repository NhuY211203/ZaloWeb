import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState, useEffect ,useRef} from "react";
import logo from "../assets/logo.png";
import {authentication} from "../config/firebase";
import {RecaptchaVerifier, signInWithPhoneNumber,getAuth, sendSignInLinkToEmail ,isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";


const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(""); 
  const [sdt, setSDT] = useState(""); 
  const [confirmationResult, setConfirmationResult] = useState(null);

 const kiemtraEmail = async (e) => {
  e.preventDefault(); // Ngăn reload trang
  try {
    console.log("Đang kiểm tra số điện thoại và email...");
    console.log("Số điện thoại:", sdt);
    console.log("Email:", email);

    // Kiểm tra số điện thoại
    const responseSDT = await axios.post('https://echoapp-rho.vercel.app/api/users/checksdt', 
      { sdt },
      { headers: { 'Content-Type': 'application/json' } }
    ).catch(err => {
      throw new Error(`Lỗi kiểm tra số điện thoại: ${err.message}`);
    });

    // Kiểm tra email
    const responseEmail = await axios.post('https://echoapp-rho.vercel.app/api/users/email', 
      { email },
      { headers: { 'Content-Type': 'application/json' } }
    ).catch(err => {
      throw new Error(`Lỗi kiểm tra email: ${err.message}`);
    });
    console.log("Kết quả kiểm tra số điện thoại:");
    console.log("Kết quả kiểm tra số điện thoại:", responseSDT.data);
    console.log("Kết quả kiểm tra email:", responseEmail.data);

    if (responseSDT.data.exists && responseEmail.data.exists) {
      console.log("Số điện thoại và Email đã được đăng ký!");
      return;
    } else if (responseSDT.data.exists && !responseEmail.data.exists) {
      console.log("Email không tồn tại nhưng Số điện thoại đã đăng ký!");
      return;
    } else if (!responseSDT.data.exists && responseEmail.data.exists) {
      console.log("Số điện thoại không tồn tại nhưng Gmail đã đăng ký!");
      return;
    } else {
      console.log("Đã gửi xác thực về gmail!");
      await sendEmailVerification();
    }

  } catch (err) {
    console.error("Lỗi kiểm tra email và số điện thoại:", {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      config: err.config
    });
  }
};

  const sendEmailVerification = async () => {
    const actionCodeSettings = {
      url: "http://localhost:5173/verify-code", // Đổi thành URL ứng dụng của bạn
      handleCodeInApp: true,
    };
  
    try {
      await sendSignInLinkToEmail(authentication, email, actionCodeSettings);
      console.log("Email xác thực đã gửi!");
      window.localStorage.setItem("emailForSignIn", email);
      // Đóng trang sau 2 giây
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Lỗi khi gửi email:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#DEF7FF]">
      <img src={logo} alt="Echo Logo" className="w-32 h-32 mb-4" />
      <p className="text-gray-600">Khôi phục mật khẩu Echo</p>

      <div className="bg-white p-6 mt-4 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-bold">Nhập số điện thoại</h2>
        <input
          type="text"
          placeholder="Số điện thoại"
          className="w-full p-2 border rounded mt-2"
          value={sdt}
          onChange={(e) => setSDT(e.target.value)}
        />
        <h2 className="text-lg font-bold">Nhập Email</h2>
        <input
          type="text"
          placeholder="Email"
          className="w-full p-2 border rounded mt-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button className="w-full bg-blue-500 text-white p-2 mt-4 rounded" onClick={kiemtraEmail}>Tiếp tục</button>
        <p className="text-gray-500 text-center cursor-pointer mt-2" onClick={() => navigate("/login-password")}>Quay lại</p>
      </div>
    </div>
  );
};

export default ForgotPassword;

