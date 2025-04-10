import * as FaIcons from "react-icons/fa";
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

export default LanguageModal;