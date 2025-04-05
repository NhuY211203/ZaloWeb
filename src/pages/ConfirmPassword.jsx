import { useNavigate, useLocation } from "react-router-dom"; // Thêm useLocation
import axios from "axios";
import { useState } from "react";
import logo from "../assets/logo.png";

const ConfirmPassword = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Thêm để nhận state
  const { email, sdt } = location.state || {}; // Lấy email và sdt từ state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleConfirmPassword = async (e) => {
    e.preventDefault(); // Ngăn reload trang

    // Kiểm tra mật khẩu có khớp không
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp!");
      return;
    }

    try {
      console.log("Đang xác nhận mật khẩu...");
      console.log("Email:", email);
      console.log("Số điện thoại:", sdt);
      console.log("Mật khẩu mới:", newPassword);
      console.log("Xác nhận mật khẩu:", confirmPassword);

      // Gửi yêu cầu cập nhật mật khẩu mới đến server
      const response = await axios.post(
        "https://echoapp-rho.vercel.app/api/users/update-password",
        { email, sdt, newPassword }, // Thêm email và sdt vào payload
        { headers: { "Content-Type": "application/json" } }
      ).catch((err) => {
        throw new Error(`Lỗi khi cập nhật mật khẩu: ${err.message}`);
      });

      console.log("Kết quả cập nhật mật khẩu:", response.data);

      if (response.data.success) {
        console.log("Cập nhật mật khẩu thành công!");
        // Chuyển hướng về trang đăng nhập sau 2 giây
        setTimeout(() => {
          navigate("/login-password");
        }, 2000);
      } else {
        setError("Có lỗi xảy ra khi cập nhật mật khẩu. Vui lòng thử lại!");
      }
    } catch (err) {
      console.error("Lỗi khi xác nhận mật khẩu:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config,
      });
      setError("Có lỗi xảy ra. Vui lòng thử lại!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#DEF7FF]">
      <img src={logo} alt="Echo Logo" className="w-32 h-32 mb-4" />
      <p className="text-gray-600">Khôi phục mật khẩu Echo</p>

      <div className="bg-white p-6 mt-4 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-bold">Mật khẩu mới</h2>
        <input
          type="password"
          placeholder="Mật khẩu mới"
          className="w-full p-2 border rounded mt-2"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <h2 className="text-lg font-bold mt-4">Xác nhận mật khẩu mới</h2>
        <input
          type="password"placeholder="Xác nhận mật khẩu mới"
          className="w-full p-2 border rounded mt-2"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {error && <p className="text-red-500 text-center mt-2">{error}</p>}

        <button
          className="w-full bg-blue-500 text-white p-2 mt-4 rounded"
          onClick={handleConfirmPassword}
        >
          Tiếp tục
        </button>
        <p
          className="text-gray-500 text-center cursor-pointer mt-2"
          onClick={() => navigate("/forgot-password")}
        >
          Quay lại
        </p>
      </div>
    </div>
  );
};

export default ConfirmPassword;