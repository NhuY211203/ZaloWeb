import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { authentication } from "../config/firebase"; // Import Firebase Auth
import { useState, useEffect } from "react";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth"; // Import cần thiết

const VerifyCode = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(""); // Email state
  const [isVerified, setIsVerified] = useState(false); // Trạng thái xác thực

  useEffect(() => {
    if (isSignInWithEmailLink(authentication, window.location.href)) {
      let emailStored = window.localStorage.getItem("emailForSignIn");

      if (!emailStored) {
        emailStored = prompt("Nhập email của bạn để xác thực:");
      }

      if (emailStored) {
        signInWithEmailLink(authentication, emailStored, window.location.href)
          .then((result) => {
            console.log("✅ Xác thực thành công!", result.user);
            setEmail(emailStored);
            window.localStorage.removeItem("emailForSignIn");

            // Chuyển hướng sang trang đổi mật khẩu
            setTimeout(() => {
              navigate("/", { state: { email: emailStored } });
            }, 2000); // Chờ 2 giây rồi chuyển hướng
          })
          .catch((error) => {
            console.error("❌ Lỗi xác thực email:", error);
          });
      }
    }
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#DEF7FF]">
      <img src={logo} alt="Echo Logo" className="w-32 h-32 mb-4" />
      <p className="text-gray-600">Khôi phục mật khẩu Echo</p>

      <div className="bg-white p-6 mt-4 rounded-lg shadow-lg w-96">
        {isVerified ? (
          <h2 className="text-lg font-bold text-green-600">Xác thực thành công! Đang chuyển hướng...</h2>
        ) : (
          <>
            <h2 className="text-lg font-bold">Đang xác thực...</h2>
            <p className="text-gray-500 mt-2">Vui lòng chờ, không đóng trang này.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyCode;