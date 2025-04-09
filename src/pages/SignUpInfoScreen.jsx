// pages/SignUpInfoScreen.jsx
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import logo from "../assets/logo.png";

const SignUpInfoScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, sdt } = location.state || {};

  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [gender, setGender] = useState("Nam"); // Mặc định là Nam
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("Email:", email);
    console.log("Số điện thoại:", sdt);
  }, [email, sdt]);

  const handleSignUp = async () => {
    if (!name || !birth || !password || !rePassword) {
      setError("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu không hợp lệ! (Tối thiểu 6 ký tự)");
      return;
    }

    if (password !== rePassword) {
      setError("Mật khẩu không khớp!");
      return;
    }
    try {
      const response = await fetch("https://echoapp-rho.vercel.app/api/registerUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          sdt: sdt,
          name: name,
          ngaySinh: birth,
          matKhau: password,
          email: email,
          gioTinh:gender
        }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      
      navigate("/login-password");
    } catch (error) {
      console.error("Error during register:", error);
      throw error;
    }
  };
  useEffect(() => {
    if (name.length > 0 && birth.length > 0 && password.length >= 6 && rePassword.length > 0) {
      setEnabled(true);
    } else {
      setEnabled(false);
    }
  }, [name, birth, password, rePassword]);

  return (
    <div className="layout-container">
      <img src={logo} alt="Echo Logo" className="w-32 h-32 mb-4" />
      <p className="text-gray-600 text-center mt-2">Đăng ký tài khoản Echo</p>

      <div className="container mt-4">
        <h2 className="text-lg font-bold mb-4">Thông tin bổ sung</h2>
        <input
          type="text"
          placeholder="Tên hiển thị"
          className="form-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Ngày sinh (dd/mm/yyyy)"
          className="form-input"
          value={birth}
          onChange={(e) => setBirth(e.target.value)}
        />
        <div className="gender-container mb-4">
          <p className="label">Giới tính</p>
          <div className="gender-options">
            <button
              className={`gender-button ${gender === "Nam" ? "selected-gender" : ""}`}
              onClick={() => setGender("Nam")}
            >
              Nam
            </button>
            <button
              className={`gender-button ${gender === "Nữ" ? "selected-gender" : ""}`}
              onClick={() => setGender("Nữ")}
            >
              Nữ
            </button>
          </div>
        </div>
        <input
          type="password"
          placeholder="Mật khẩu"
          className="form-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Nhập lại mật khẩu"
          className="form-input"
          value={rePassword}
          onChange={(e) => setRePassword(e.target.value)}
        />

        {error && <p className="text-red-500 text-center mt-2">{error}</p>}

        <button
          className={`btn-primary ${!enabled ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={handleSignUp}
          disabled={!enabled}
        >
          Tạo tài khoản
        </button>

        <p
          className="text-gray-500 text-center cursor-pointer mt-2 hover:text-gray-700 transition-colors"
          onClick={() => navigate("/signup")}
        >
          Quay lại
        </p>
      </div>
    </div>
  );
};

export default SignUpInfoScreen;