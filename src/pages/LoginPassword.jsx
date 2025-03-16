


import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const LoginPassword = () => {
  const navigate = useNavigate();

  return (
    <div className="layout-container">
      <img src={logo} alt="Echo Logo" className="w-32 h-32 mb-4" />
      <p className="text-gray-600 text-center mt-2">Đăng nhập tài khoản Echo để kết nối với Echo Web</p>

      <div className="container mt-4">
        <h2 className="text-lg font-bold mb-4">Đăng nhập với mật khẩu</h2>
        <input type="text" placeholder="Số điện thoại" className="form-input" />
        <input type="password" placeholder="Mật khẩu" className="form-input" />
        <button className="btn-primary">Đăng nhập với mật khẩu</button>
        <p className="text-blue-500 mt-4 text-center cursor-pointer" onClick={() => navigate("/forgot-password")}>Quên mật khẩu</p>
        <p className="text-gray-500 text-center cursor-pointer mt-2" onClick={() => navigate("/")}>Đăng nhập qua mã QR</p>
      </div>
    </div>
  );
};

export default LoginPassword;

