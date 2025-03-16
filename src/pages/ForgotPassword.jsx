import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const ForgotPassword = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#DEF7FF]">
      <img src={logo} alt="Echo Logo" className="w-32 h-32 mb-4" />
      <p className="text-gray-600">Khôi phục mật khẩu Echo</p>

      <div className="bg-white p-6 mt-4 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-bold">Nhập số điện thoại của bạn</h2>
        <input type="text" placeholder="Số điện thoại" className="w-full p-2 border rounded mt-2" />
        <button className="w-full bg-blue-500 text-white p-2 mt-4 rounded" onClick={() => navigate("/verify-code")}>Tiếp tục</button>
        <p className="text-gray-500 text-center cursor-pointer mt-2" onClick={() => navigate("/login-password")}>Quay lại</p>
      </div>
    </div>
  );
};

export default ForgotPassword;

