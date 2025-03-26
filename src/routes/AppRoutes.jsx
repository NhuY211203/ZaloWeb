import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginQR from "../pages/LoginQR.jsx";
import LoginPassword from "../pages/LoginPassword.jsx";
import ForgotPassword from "../pages/ForgotPassword.jsx";
import VerifyCode from "../pages/VerifyCode.jsx";
import HomePage from "../components/HomePage.jsx"; // ✅ Thêm trang chính

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginQR />} />
        <Route path="/login-password" element={<LoginPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-code" element={<VerifyCode />} />
        <Route path="/home" element={<HomePage />} /> {/* ✅ Thêm đường dẫn trang chính */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
