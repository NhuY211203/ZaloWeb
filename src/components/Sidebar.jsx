import React, { useState } from "react";
import "../styles/Sidebar.css";
import * as FaIcons from "react-icons/fa";

const SettingsModal = ({ onClose, onOpenProfile, onOpenSettings, onOpenLanguage, onOpenSupport, onOpenData }) => {
  return (
    <div className="modal-overlay settings-modal">
      <div className="modal-content">
        <div className="modal-header">
          <button onClick={onClose} className="close-btn">
            <FaIcons.FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <div className="modal-item" onClick={onOpenProfile}>
            <FaIcons.FaUser className="modal-icon" />
            <span>Hồ sơ của bạn</span>
          </div>
          <div className="modal-item" onClick={onOpenSettings}>
            <FaIcons.FaCog className="modal-icon" />
            <span>Cài đặt</span>
            <FaIcons.FaChevronRight className="chevron-icon" />
          </div>
          <div className="modal-item" onClick={onOpenLanguage}>
            <FaIcons.FaGlobe className="modal-icon" />
            <span>Ngôn ngữ</span>
            <FaIcons.FaChevronRight className="chevron-icon" />
          </div>
          <div className="modal-item" onClick={onOpenSupport}>
            <FaIcons.FaQuestionCircle className="modal-icon" />
            <span>Hỗ trợ</span>
            <FaIcons.FaChevronRight className="chevron-icon" />
          </div>
          <div className="modal-item" onClick={onOpenData}>
            <FaIcons.FaDatabase className="modal-icon" />
            <span>Dữ liệu</span>
            <FaIcons.FaChevronRight className="chevron-icon" />
          </div>
          <div className="modal-item logout">
            <FaIcons.FaSignOutAlt className="modal-icon" />
            <span>Đăng xuất</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const GeneralSettingsModal = ({ onClose, onSwitchToPrivacy }) => {
  return (
    <div className="modal-overlay settings-modal">
      <div className="modal-content settings-content">
        <div className="modal-header">
          <h2>Cài đặt</h2>
          <button onClick={onClose} className="close-btn">
            <FaIcons.FaTimes />
          </button>
        </div>
        <div className="modal-body settings-body">
          <div className="settings-tabs">
            <span className="tab active">Cài đặt chung</span>
            <span className="tab" onClick={onSwitchToPrivacy}>Quyền riêng tư</span>
            <span className="tab">Giao diện</span>
            <span className="tab">Thông báo</span>
            <span className="tab">Tin nhắn</span>
          </div>
          <div className="settings-section">
            <h4>Danh bạ</h4>
            <div className="settings-item">
              <span>Hiển thị tất cả bạn bè được nghi nhận trong danh bạ</span>
              <label className="switch">
                <input type="checkbox" />
                <span className="slider"></span>
              </label>
            </div>
            <div className="settings-item">
              <span>Chỉ hiển thị bạn bè đang sử dụng Zalo</span>
              <label className="switch">
                <input type="checkbox" />
                <span className="slider"></span>
              </label>
            </div>
          </div>
          <div className="settings-section">
            <h4>Ngôn ngữ</h4>
            <div className="settings-item">
              <span>Thay đổi ngôn ngữ</span>
              <span className="language-option">Tiếng Việt <FaIcons.FaChevronRight className="chevron-icon" /></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PrivacySettingsModal = ({ onClose, onSwitchToGeneral }) => {
  return (
    <div className="modal-overlay settings-modal">
      <div className="modal-content settings-content">
        <div className="modal-header">
          <h2>Cài đặt</h2>
          <button onClick={onClose} className="close-btn">
            <FaIcons.FaTimes />
          </button>
        </div>
        <div className="modal-body settings-body">
          <div className="settings-tabs">
            <span className="tab" onClick={onSwitchToGeneral}>Cài đặt chung</span>
            <span className="tab active">Quyền riêng tư</span>
            <span className="tab">Giao diện</span>
            <span className="tab">Thông báo</span>
            <span className="tab">Tin nhắn</span>
          </div>
          <div className="settings-section">
            <h4>Chặn tin nhắn</h4>
            <div className="settings-item">
              <span>Tin nhắn và cuộc gọi</span>
              <span className="option">Không <FaIcons.FaChevronRight className="chevron-icon" /></span>
            </div>
            <div className="settings-item">
              <span>Hiển thị trạng thái Đã xem</span>
              <label className="switch">
                <input type="checkbox" />
                <span className="slider"></span>
              </label>
            </div>
            <div className="settings-item">
              <span>Cho phép người lạ kết bạn sử dụng Zalo</span>
              <label className="switch">
                <input type="checkbox" />
                <span className="slider"></span>
              </label>
            </div>
          </div>
          <div className="settings-section">
            <h4>Chặn người lạ tìm kiếm và kết bạn</h4>
            <div className="settings-item">
              <span>Cho phép người lạ tìm kiếm bạn</span>
              <label className="switch">
                <input type="checkbox" />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal "Ngôn ngữ"
const LanguageModal = ({ onClose }) => {
  return (
    <div className="modal-overlay settings-modal language-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Ngôn ngữ</h2>
          <button onClick={onClose} className="close-btn">
            <FaIcons.FaTimes />
          </button>
        </div>
        <div className="modal-body settings-body">
          <div className="language-item">
            <span>Tiếng Việt</span>
            <FaIcons.FaCheck className="check-icon" />
          </div>
          <div className="language-item">
            <span>English</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal "Hỗ trợ"
const SupportModal = ({ onClose }) => {
  return (
    <div className="modal-overlay settings-modal support-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Hỗ trợ</h2>
          <button onClick={onClose} className="close-btn">
            <FaIcons.FaTimes />
          </button>
        </div>
        <div className="modal-body settings-body">
          <div className="support-item">
            <span>Liên hệ</span>
          </div>
          <div className="support-item">
            <span>Câu hỏi thường gặp</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal "Dữ liệu"
const DataModal = ({ onClose }) => {
  return (
    <div className="modal-overlay settings-modal data-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Dữ liệu</h2>
          <button onClick={onClose} className="close-btn">
            <FaIcons.FaTimes />
          </button>
        </div>
        <div className="modal-body settings-body">
          <div className="support-item">
            <span>Quản lý dữ liệu</span>
          </div>
        </div>
      </div>
    </div>
  );
};


// hien thong tin khi nhap anh dai dien
const ProfileModal = ({ onClose, onOpenProfile,user }) => {
  return (
    <div className="modal-overlay profile-modal">
      <div className="modal-content">
        <div className="modal-header">
          <div className="avatar"><img
              src={user?.anhDaiDien || "/default-avatar.png"}
              alt="Avatar"
              width="100"
              height="100"
            /></div>
          <h2>{user.name|| "User"}</h2>
          <button onClick={onClose} className="close-btn">
            <FaIcons.FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <div className="modal-item" onClick={onOpenProfile} user={user}>
            <FaIcons.FaUser className="modal-icon" />
            <span>Hồ sơ của bạn</span>
          </div>
          <div className="modal-item">
            <FaIcons.FaCog className="modal-icon" />
            <span>Cài đặt</span>
          </div>
          <div className="modal-item logout">
            <FaIcons.FaSignOutAlt className="modal-icon" />
            <span>Đăng xuất</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserProfileModal = ({ onClose ,user}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    gender: "Nữ",
    dob: "01 tháng 12, 2003",
    phone: "+84 367 222 555",
  });

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    console.log("Profile saved:", profile);
  };

  return (
    <div className="modal-overlay profile-info-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Thông tin tài khoản</h2>
          <button onClick={onClose} className="close-btn">
            <FaIcons.FaTimes />
          </button>
        </div>
        <div className="modal-body profile-info">
        <div className="avatar large">
            <img
              src={user?.anhDaiDien || "/default-avatar.png"}
              alt="Avatar"
              width="100"
              height="100"
            />
        </div>
          <h3>User</h3>
          <div className="info-section">
            <h4>Thông tin cá nhân</h4>
            {isEditing ? (
              <>
                <p>
                  Giới tính:
                  <input
                    type="text"
                    name="gender"
                    value={profile.gender}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                </p>
                <p>
                  Ngày sinh:
                  <input
                    type="text"
                    name="dob"
                    value={profile.dob}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                </p>
                <p>
                  Điện thoại:
                  <input
                    type="text"
                    name="phone"
                    value={profile.phone}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                </p>
              </>
            ) : (
              <>
                <p>Giới tính: {profile.gender}</p>
                <p>Ngày sinh: {profile.dob}</p>
                <p>Điện thoại: {profile.phone}</p>
                <p>Chỉ bạn bè có lưu số của bạn trong danh bạ máy xem được số này</p>
              </>
            )}
          </div>
          {isEditing ? (
            <div className="button-group">
              <button className="save-btn" onClick={handleSave}>
                Lưu
              </button>
              <button className="cancel-btn" onClick={handleEditToggle}>
                Hủy
              </button>
            </div>
          ) : (
            <button className="update-btn" onClick={handleEditToggle}>
              <FaIcons.FaPen className="update-icon" />
              Cập nhật
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({user}) => {
  const [activeButton, setActiveButton] = useState("chat");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [isGeneralSettingsOpen, setIsGeneralSettingsOpen] = useState(false);
  const [isPrivacySettingsOpen, setIsPrivacySettingsOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isDataOpen, setIsDataOpen] = useState(false);

  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName);
  };

  const openSettingsModal = () => {
    setIsSettingsOpen(true);
  };

  const closeSettingsModal = () => {
    setIsSettingsOpen(false);
  };

  const openProfileModal = () => {
    setIsProfileOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileOpen(false);
  };

  const openUserProfileModal = () => {
    setIsProfileOpen(false);
    setIsSettingsOpen(false);
    setIsUserProfileOpen(true);
  };

  const closeUserProfileModal = () => {
    setIsUserProfileOpen(false);
  };

  const openGeneralSettingsModal = () => {
    setIsSettingsOpen(false);
    setIsGeneralSettingsOpen(true);
  };

  const closeGeneralSettingsModal = () => {
    setIsGeneralSettingsOpen(false);
  };

  const openPrivacySettingsModal = () => {
    setIsGeneralSettingsOpen(false);
    setIsPrivacySettingsOpen(true);
  };

  const closePrivacySettingsModal = () => {
    setIsPrivacySettingsOpen(false);
  };

  const openLanguageModal = () => {
    setIsSettingsOpen(false);
    setIsLanguageOpen(true);
  };

  const closeLanguageModal = () => {
    setIsLanguageOpen(false);
  };

  const openSupportModal = () => {
    setIsSettingsOpen(false);
    setIsSupportOpen(true);
  };

  const closeSupportModal = () => {
    setIsSupportOpen(false);
  };

  const openDataModal = () => {
    setIsSettingsOpen(false);
    setIsDataOpen(true);
  };

  const closeDataModal = () => {
    setIsDataOpen(false);
  };

  return (
    <div className="sidebar">
      {/* Avatar */}
      <div className="avatar" onClick={openProfileModal} user={user}><img src={user.anhDaiDien} alt="Avatar"  /> </div>

      {/* Icons */}
      <div className="icon-group">
        <div
          className={`icon ${activeButton === "chat" ? "active" : ""}`}
          onClick={() => handleButtonClick("chat")}
        >
          <FaIcons.FaComments className="iconn" />
        </div>
        <div
          className={`icon ${activeButton === "profile" ? "active" : ""}`}
          onClick={() => handleButtonClick("profile")}
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
          onClick={openSettingsModal}
          user={user}
        >
          <FaIcons.FaCog className="iconn" />
        </div>
      </div>

      {/* Modals */}
      {isSettingsOpen && (
        <SettingsModal
          onClose={closeSettingsModal}
          onOpenProfile={openUserProfileModal}
          onOpenSettings={openGeneralSettingsModal}
          onOpenLanguage={openLanguageModal}
          onOpenSupport={openSupportModal}
          onOpenData={openDataModal}
          user={user}
        />
      )}
      {isProfileOpen && (
        <ProfileModal
          onClose={closeProfileModal}
          onOpenProfile={openUserProfileModal}
          user={user}

        />
      )}
      {isUserProfileOpen && <UserProfileModal onClose={closeUserProfileModal} />}
      {isGeneralSettingsOpen && (
        <GeneralSettingsModal
          onClose={closeGeneralSettingsModal}
          onSwitchToPrivacy={openPrivacySettingsModal}
          user={user}
        />
      )}
      {isPrivacySettingsOpen && (
        <PrivacySettingsModal
          onClose={closePrivacySettingsModal}
          onSwitchToGeneral={closePrivacySettingsModal}
          user={user}
        />
      )}
      {isLanguageOpen && <LanguageModal onClose={closeLanguageModal} />}
      {isSupportOpen && <SupportModal onClose={closeSupportModal} />}
      {isDataOpen && <DataModal onClose={closeDataModal} />}
    </div>
  );
};

export default Sidebar;

