import * as FaIcons from "react-icons/fa";
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

export default DataModal;