import { useState } from "react";
import "../styles/Sidebar.css"; // Import file CSS
import * as FaIcons from "react-icons/fa";

const Sidebar = () => {
  const [activeButton, setActiveButton] = useState(null);

  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName);
  };

  return (
    <div className="sidebar">
      {/* Avatar */}
      <img src="/src/assets/qr.png" alt="Avatar" className="avatar" />

      {/* Icons */}
      <div className="icon-group">
        <div
          className={`icon ${activeButton === "chat" ? "active" : ""}`}
          onClick={() => handleButtonClick("chat")}
        >
          <FaIcons.FaComments className="iconn"/>
        </div>
        <div
          className={`icon ${activeButton === "profile" ? "active" : ""}`}
          onClick={() => handleButtonClick("profile")}
        >
          <FaIcons.FaUser className="iconn"/>
        </div>
      </div>

      {/* Bottom Icons */}
      <div className="bottom-icons">
        <div
          className={`icon ${activeButton === "cloud" ? "active" : ""}`}
          onClick={() => handleButtonClick("cloud")}
        >
          <FaIcons.FaCloud className="iconn"/>
        </div>
        <div
          className={`icon ${activeButton === "settings" ? "active" : ""}`}
          onClick={() => handleButtonClick("settings")}
        >
          <FaIcons.FaCog className="iconn" />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
