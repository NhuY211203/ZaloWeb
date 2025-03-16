import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const VerifyCode = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#DEF7FF]">
      <img src={logo} alt="Echo Logo" className="w-32 h-32 mb-4" />
      <p className="text-gray-600">Khôi phục mật khẩu Echo</p>

      <div className="bg-white p-6 mt-4 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-bold">Nhập mã xác thực</h2>
        <input type="text" placeholder="Nhập mã kích hoạt" className="w-full p-2 border rounded mt-2" />
        <input type="password" placeholder="Mật khẩu mới" className="w-full p-2 border rounded mt-2" />
        <button className="w-full bg-blue-500 text-white p-2 mt-4 rounded">Xác nhận</button>
      </div>
    </div>
  );
};

export default VerifyCode;
