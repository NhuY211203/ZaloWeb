import * as FaIcons from 'react-icons/fa';
const ProfileModal = ({onClose, onOpenProfile,user,navigate}) => {
  console.log(user);
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
          <h2>{user?.name|| "User"}</h2>
          <button onClick={onClose} className="close-btn">
            <FaIcons.FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <div className="modal-item" onClick={()=>onOpenProfile()} >
            <FaIcons.FaUser className="modal-icon" />
            <span>Hồ sơ của bạn</span>
          </div>
          <div className="modal-item">
            <FaIcons.FaCog className="modal-icon" />
            <span>Cài đặt</span>
          </div>
          <div className="modal-item logout"onClick={()=>navigate("/login-password")} >
            <FaIcons.FaSignOutAlt className="modal-icon" />
            <span>Đăng xuất</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;