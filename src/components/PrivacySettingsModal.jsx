import * as FaIcons from "react-icons/fa";
const PrivacySettingsModal = ({ onClose, onSwitchToGeneral,user }) => {
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

export default PrivacySettingsModal;