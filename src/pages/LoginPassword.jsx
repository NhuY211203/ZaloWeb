


import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import logo from "../assets/logo.png";


const LoginPassword = () => {
  const navigate = useNavigate();
  const [sdt, setSDT] = useState("");
  const [matKhau, setPassword] = useState("");
  const [error, setError] = useState(null);
  
  const handleLogin = async (e) => {
    e.preventDefault(); // Ngăn reload trang

    try {
      const response = await axios.post("http://localhost:5000/api/login", {
        sdt,
        matKhau,
      });

      console.log("Đăng nhập thành công!", response.data);
      alert("Đăng nhập thành công!");
      navigate("/forgot-password");
    } catch (err) {
      console.error("Lỗi đăng nhập:", err.response?.data || err.message);
      setError("Email hoặc mật khẩu không đúng!");
    }
  };

  return (
    <div className="layout-container">
      <img src={logo} alt="Echo Logo" className="w-32 h-32 mb-4" />
      <p className="text-gray-600 text-center mt-2">Đăng nhập tài khoản Echo để kết nối với Echo Web</p>

      <div className="container mt-4">
        <h2 className="text-lg font-bold mb-4">Đăng nhập với mật khẩu</h2>
        <input type="text" placeholder="Số điện thoại" className="form-input" value={sdt} onChange={(e) => setSDT(e.target.value)}
          required/>
        <input type="password" placeholder="Mật khẩu" className="form-input" value={matKhau}  onChange={(e)=>setPassword(e.target.value)} />
        <button className="btn-primary" onClick={handleLogin}>Đăng nhập với mật khẩu</button>
        <p className="text-blue-500 mt-4 text-center cursor-pointer" onClick={() => navigate("/forgot-password")}>Quên mật khẩu</p>
        <p className="text-gray-500 text-center cursor-pointer mt-2" onClick={() => navigate("/")}>Đăng nhập qua mã QR</p>
      </div>
    </div>
  );
};

export default LoginPassword;

