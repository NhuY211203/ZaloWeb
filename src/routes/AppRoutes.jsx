// AppRoutes.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginQR from "../pages/LoginQR.jsx";
import LoginPassword from "../pages/LoginPassword.jsx";
import ForgotPassword from "../pages/ForgotPassword.jsx";
import VerifyCode from "../pages/VerifyCode.jsx";
import ConfirmPassword from "../pages/ConfirmPassword.jsx";
import SignUpScreen from "../pages/SignUpScreen.jsx";
import SignUpInfoScreen from "../pages/SignUpInfoScreen.jsx";
import VerifyOtpDK from "../pages/VerifyOtpDK.jsx";
import HomePage from "../components/HomePage.jsx";
import GroupMembersModal from "../components/GroupMembersModal .jsx";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginQR />} />
        <Route path="/login-password" element={<LoginPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-code" element={<VerifyCode />} />
        <Route path="/confirm-password" element={<ConfirmPassword />} />
        <Route path="/signup" element={<SignUpScreen />} />
        <Route path="/signup-info" element={<SignUpInfoScreen />} />
        <Route path="/verify-otp" element={<VerifyOtpDK />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="*" element={<Navigate to="/" />} />
        
      </Routes>
    </Router>
  );
};

export default AppRoutes;
