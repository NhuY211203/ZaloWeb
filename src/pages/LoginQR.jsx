

import { useNavigate } from "react-router-dom";
import qrImage from "../assets/qr.png";

const LoginQR = () => {
  const navigate = useNavigate();

  return (
    <div className="layout-container">
      <h1 className="text-7xl font-bold text-blue-600 text-center">Zalo</h1>
      <p className="text-gray-600 text-center mt-2">Đăng nhập tài khoản Zalo để kết nối với Zalo Web</p>

      <div className="container mt-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Đăng nhập qua mã QR</h2>
          <button onClick={() => navigate("/login-password")}>☰</button>
        </div>
        <div className="qr-container mt-4">
          {qrImage ? (
            <img src={qrImage} alt="QR Code" className="w-full h-full" />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              QR Code Placeholder
            </div>
          )}
        </div>
        <p className="text-blue-500 mt-4 text-center cursor-pointer">Chỉ dùng để đăng nhập</p>
      </div>
    </div>
  );
};

export default LoginQR;

