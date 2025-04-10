import * as FaIcons from "react-icons/fa";
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

export default GeneralSettingsModal;