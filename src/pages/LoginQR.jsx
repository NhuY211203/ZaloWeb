// pages/LoginQR.jsx
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import qrImage from "../assets/qr.png";
import logo from "../assets/logo.png";

const LoginQR = () => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State để kiểm soát modal

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen); // Mở/đóng modal khi nhấn nút 3 gạch
  };

  const handleLoginWithPassword = () => {
    setIsMenuOpen(false); // Đóng modal
    navigate("/login-password"); // Chuyển đến trang đăng nhập
  };

  const handleSignUp = () => {
    setIsMenuOpen(false); // Đóng modal
    navigate("/signup"); // Chuyển đến trang đăng ký
  };

  return (
    <div className="layout-container">
      <img src={logo} alt="Echo Logo" className="w-32 h-32 mb-4" />
      <p className="text-gray-600 text-center mt-2">
        Đăng nhập tài khoản Echo để kết nối với Echo Web
      </p>

      <div className="container mt-4 relative">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Đăng nhập qua mã QR</h2>
          <div className="relative">
            <button onClick={handleMenuClick}>☰</button>

            {/* Modal hiển thị ngay bên dưới nút 3 gạch, sát viền phải */}
            {isMenuOpen && (
              <div className="absolute top-8 right-0 bg-white p-4 rounded-lg shadow-lg z-10 w-48">
                <button
                  className="block w-full text-left py-2 px-4 hover:bg-gray-100"
                  onClick={handleLoginWithPassword}
                >
                  Đăng nhập
                </button>
                <button
                  className="block w-full text-left py-2 px-4 hover:bg-gray-100"
                  onClick={handleSignUp}
                >
                  Đăng ký
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="qr-container mt-4">
          {qrImage ? (
            <img src={qrImage} alt="QR Code" className="w-full h-full" />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              QR Code Placeholder
            </div>
          )}
        </div>

        <p className="text-blue-500 mt-4 text-center cursor-pointer">
          Chỉ dùng để đăng nhập
        </p>
      </div>
    </div>
  );
};

export default LoginQR;
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import qrImage from "../assets/qr.png";
// import logo from "../assets/logo.png";

// const LoginQR = () => {
//   const navigate = useNavigate();
//   const [isScanning, setIsScanning] = useState(false);


//   return (
//     <div className="layout-container">
//       <img src={logo} alt="Echo Logo" className="w-32 h-32 mb-4" />
//       <p className="text-gray-600 text-center mt-2">Đăng nhập tài khoản Echo để kết nối với Echo Web</p>

//       <div className="container mt-4">
//         <div className="flex justify-between items-center">
//           <h2 className="text-lg font-bold">Đăng nhập qua mã QR</h2>
//           <button onClick={() => navigate("/login-password")}>☰</button>
//         </div>
//         <div className="qr-container mt-4">
//           {qrImage ? (
//             <img src={qrImage} alt="QR Code" className="w-full h-full" />
//           ) : (
//             <div className="w-full h-full bg-gray-200 flex items-center justify-center">
//               QR Code Placeholder
//             </div>
//           )}
//         </div>

//         {/* Nút giả lập quét mã QR
//         {!isScanning ? (
//           <button
//             className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
//             onClick={() => setIsScanning(true)}
//           >
//             Quét mã QR
//           </button>
//         ) : (
//           <p className="text-green-500 mt-4">Đang quét mã QR... Vui lòng chờ</p>
//         )} */}

//         <p className="text-blue-500 mt-4 text-center cursor-pointer">Chỉ dùng để đăng nhập</p>
//       </div>
//     </div>
//   );
// };

// export default LoginQR;
