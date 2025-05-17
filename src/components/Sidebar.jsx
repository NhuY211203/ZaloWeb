import React, { useState } from "react";
import * as FaIcons from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import SettingsModal from "./SettingsModal";
import GeneralSettingsModal from "./GeneralSettingsModal";
import PrivacySettingsModal from "./PrivacySettingsModal";
import LanguageModal from "./LanguageModal";
import SupportModal from "./SupportModal";
import DataModal from "./DataModal";
import ProfileModal from "./ProfileModal";
import UserProfileModal from "./UserProfileModal";
import "../styles/Sidebar.css";

const Sidebar = ({ user, onChangeView,setUser}) => {
  const navigate = useNavigate();
  const [activeButton, setActiveButton] = useState("chat");

  // Sử dụng một state để quản lý tất cả các modal
  const [modals, setModals] = useState({
    settings: false,
    profile: false,
    userProfile: false,
    generalSettings: false,
    privacySettings: false,
    language: false,
    support: false,
    data: false
  });

  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName);
    onChangeView(buttonName); // Cập nhật trạng thái view
  };

  // Mở modal
  const openModal = (modalName) => {
    setModals((prevModals) => ({ ...prevModals, [modalName]: true }));
  };

  // Đóng modal
  const closeModal = (modalName) => {
    setModals((prevModals) => ({ ...prevModals, [modalName]: false }));
  };

  return (
    <div className="sidebar">
      {/* Avatar */}
      <div className="avatar" onClick={() => openModal("profile")}>
        <img src={user?.anhDaiDien} alt="Avatar" />
      </div>

      {/* Icons */}
      <div className="icon-group">
        <div
          className={`icon ${activeButton === "chat" ? "active" : ""}`}
          onClick={() => handleButtonClick("chat")}
        >
          <FaIcons.FaComments className="iconn" />
        </div>
        <div
          className={`icon ${activeButton === "friend" ? "active" : ""}`}
          onClick={() => handleButtonClick("friend")}
        >
          <FaIcons.FaUser className="iconn" />
        </div>
      </div>

      {/* Bottom Icons */}
      <div className="bottom-icons">
        <div
          className={`icon ${activeButton === "cloud" ? "active" : ""}`}
          onClick={() => handleButtonClick("cloud")}
        >
          <FaIcons.FaCloud className="iconn" />
        </div>
        <div
          className={`icon ${activeButton === "settings" ? "active" : ""}`}
          onClick={() => openModal("settings")}
        >
          <FaIcons.FaCog className="iconn" />
        </div>
      </div>

      {/* Modals */}
      {modals.settings && (
        <SettingsModal
          onClose={() => closeModal("settings")}
          onOpenProfile={() => openModal("userProfile")}
          onOpenSettings={() => openModal("generalSettings")}
          onOpenLanguage={() => openModal("language")}
          onOpenSupport={() => openModal("support")}
          onOpenData={() => openModal("data")}
          user={user}
        />
      )}
      {modals.profile && (
        <ProfileModal 
        onClose={() => closeModal("profile")} 
        user={user} navigate={navigate} 
        onOpenProfile={() => openModal("userProfile")}
        onOpenSettings={() => openModal("generalSettings")}
        />
      )}
      {modals.userProfile && <UserProfileModal onClose={() => closeModal("userProfile")} user={user} setUser={setUser} />}
      {modals.generalSettings && (
        <GeneralSettingsModal
          onClose={() => closeModal("generalSettings")}
          onSwitchToPrivacy={() => openModal("privacySettings")}
          user={user}
        />
      )}
      {modals.privacySettings && (
        <PrivacySettingsModal
          onClose={() => closeModal("privacySettings")}
          onSwitchToGeneral={() => openModal("generalSettings")}
          user={user}
        />
      )}
      {modals.language && <LanguageModal onClose={() => closeModal("language")} />}
      {modals.support && <SupportModal onClose={() => closeModal("support")} />}
      {modals.data && <DataModal onClose={() => closeModal("data")} />}
    </div>
  );
};

export default Sidebar;
