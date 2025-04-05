import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import logo from "../assets/logo.png";
import { authentication } from "../config/firebase";
import { sendSignInLinkToEmail } from "firebase/auth";

// Kiểm tra tính hợp lệ của email
const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

// Bắt đầu 03, 05, 07, 08, 09 và có 10 chữ số
const isValidPhoneNumber = (phoneNumber) => {
  const phoneRegex = /^(0[3,5,7,8,9])[0-9]{8}$/;
  return phoneRegex.test(phoneNumber);
};


const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sdt, setSDT] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // Lưu trữ thông báo lỗi

  const kiemtraEmail = async (e) => {
    e.preventDefault(); // Ngăn reload trang
    setErrorMessage(""); // Xóa lỗi cũ
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
      console.log("Đã gửi xác thực về gmail!");
      await sendEmailVerification();

      return;
    } else if (responseSDT.data.exists && !responseEmail.data.exists) {
      console.log("Email không tồn tại nhưng Số điện thoại đã đăng ký!");
      return;
    } else if (!responseSDT.data.exists && responseEmail.data.exists) {
      console.log("Số điện thoại không tồn tại nhưng Gmail đã đăng ký!");
      return;
    } else {
      console.log("Số điện thoại và email không tồn tại!");
      return;
    }
    // Kiểm tra tính hợp lệ của email và số điện thoại
    if (!isValidEmail(email)) {
      setErrorMessage("Email không hợp lệ");
      return;
    }

    if (!isValidPhoneNumber(sdt)) {
      setErrorMessage("Số điện thoại không hợp lệ");
      return;
    }

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
      setErrorMessage(`Lỗi kiểm tra email và số điện thoại: ${err.message}`);
      console.error(err);
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

        {errorMessage && <p className="text-red-500 text-center mt-2">{errorMessage}</p>} {/* Hiển thị thông báo lỗi */}

        <button
          className="w-full bg-blue-500 text-white p-2 mt-4 rounded"
          onClick={kiemtraEmail}
        >
          Tiếp tục
        </button>
        
        <p className="text-gray-500 text-center cursor-pointer mt-2" onClick={() => navigate("/login-password")}>
          Quay lại
        </p>
      </div>
    </div>
  );
  };
export default ForgotPassword;
