import * as FaIcons from "react-icons/fa";
const SettingsModal = ({ onClose, onOpenProfile, onOpenSettings, onOpenLanguage, onOpenSupport, onOpenData ,user }) => {
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

export default SettingsModal;