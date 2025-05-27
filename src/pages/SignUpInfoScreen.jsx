import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
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

  // Validate tên: ít nhất 2 từ, mỗi từ bắt đầu chữ hoa
  const validateName = (name) => {
    const nameRegex = /^([A-ZÀ-Ỵ][a-zà-ỹ]*)(\s[A-ZÀ-Ỵ][a-zà-ỹ]*)+$/;
    return nameRegex.test(name);
  };

  // Validate ngày sinh dd/mm/yyyy
  const validateDateFormat = (date) => {
    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d\d$/;
    return regex.test(date);
  };

  // Kiểm tra tuổi >= 18 (JS thuần)
  const validateAge = (dateString) => {
    if (!validateDateFormat(dateString)) return false;
    const [day, month, year] = dateString.split("/").map(Number);
    const birthDate = new Date(year, month - 1, day);
    if (isNaN(birthDate.getTime())) return false;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

    return age >= 18;
  };

  // Mật khẩu tối thiểu 8 ký tự, ít nhất 1 chữ và 1 số
  const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSignUp = async () => {
    // Kiểm tra nếu các trường không được nhập
    if (!name || !birth || !password || !rePassword) {
      setError("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    if (!validateName(name)) {
      setError("Họ tên không hợp lệ! Ít nhất 2 từ, mỗi từ bắt đầu chữ hoa.");
      return;
    }
    if (!validateDateFormat(birth)) {
      setError("Ngày sinh không đúng định dạng dd/mm/yyyy!");
      return;
    }
    if (!validateAge(birth)) {
      setError("Bạn phải từ 18 tuổi trở lên để đăng ký.");
      return;
    }
    if (!isValidPassword(password)) {
      setError("Mật khẩu không hợp lệ! Tối thiểu 8 ký tự, có ít nhất 1 chữ và 1 số.");
      return;
    }
    if (password !== rePassword) {
      setError("Mật khẩu không khớp!");
      return;
    }

    setError(""); // Xóa lỗi nếu tất cả hợp lệ

    try {
      const response = await fetch("https://cnm-service.onrender.com/api/registerUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sdt,
          name,
          ngaySinh: birth,
          matKhau: password,
          email,
          gioTinh: gender,
        }),
      });

      if (!response.ok) throw new Error("Network response was not ok");
      navigate("/login-password");
    } catch (error) {
      console.error("Error during register:", error);
      setError("Đăng ký thất bại. Vui lòng thử lại.");
    }
  };

  useEffect(() => {
    // Kiểm tra điều kiện hợp lệ chỉ khi có thay đổi trong các trường dữ liệu
    const valid =
      name.length > 0 &&
      birth.length > 0 &&
      password.length >= 8 &&
      rePassword.length > 0 &&
      validateName(name) &&
      validateDateFormat(birth) &&
      validateAge(birth) &&
      isValidPassword(password) &&
      password === rePassword;

    setEnabled(valid);

    // Chỉ hiển thị lỗi khi các trường đã nhập
    if (name && !validateName(name)) setError("Họ tên không hợp lệ! Ít nhất 2 từ, mỗi từ bắt đầu chữ hoa.");
    else if (birth && !validateDateFormat(birth)) setError("Ngày sinh không đúng định dạng dd/mm/yyyy!");
    else if (birth && !validateAge(birth)) setError("Bạn phải từ 18 tuổi trở lên để đăng ký.");
    else if (password && !isValidPassword(password)) setError("Mật khẩu không hợp lệ! Tối thiểu 8 ký tự, có ít nhất 1 chữ và 1 số.");
    else if (password && rePassword && password !== rePassword) setError("Mật khẩu không khớp!");
    else setError(""); // Không hiển thị lỗi khi chưa có thông tin

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
          className="btn-primary"
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
