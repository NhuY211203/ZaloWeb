import * as FaIcons from "react-icons/fa";
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


export default SupportModal;