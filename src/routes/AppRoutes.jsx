import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginQR from "../pages/LoginQR.jsx";
import LoginPassword from "../pages/LoginPassword.jsx";
import ForgotPassword from "../pages/ForgotPassword.jsx";
import VerifyCode from "../pages/VerifyCode.jsx";
import ConfirmPassword from "../pages/ConfirmPassword.jsx"; // Đảm bảo tên file và import chính xác
import HomePage from "../components/HomePage.jsx";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ForgotPassword/>} />
        <Route path="/login-password" element={<LoginPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-code" element={<VerifyCode />} />
<<<<<<< HEAD
        <Route path="/confirm-password" element={<ConfirmPassword />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="*" element={<Navigate to="/" />} />
=======
        <Route path="/home" element={<HomePage />} /> {/* ✅ Thêm đường dẫn trang chính */}
        <Route path="*" element={<Navigate to="/forgot-password" />} />
>>>>>>> cba3ace0b185b93c55c4ce20ec7be6d1995afd06
      </Routes>
    </Router>
  );
};

export default AppRoutes;