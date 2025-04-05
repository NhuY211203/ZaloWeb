import React, { useState } from "react";
import "../styles/ChatWindow.css";
import * as FaIcons from "react-icons/fa";
import * as MdIcons from "react-icons/md";
import * as IoIcons from "react-icons/io";
import * as BsIcons from "react-icons/bs";
import * as BiIcons from "react-icons/bi";

const ChatWindow = ({ selectedChat }) => {
  const [isInfoOpen, setIsInfoOpen] = useState(true); // State để quản lý đóng/mở thông tin hội thoại

  const toggleInfo = () => {
    setIsInfoOpen(!isInfoOpen);
  };

  if (!selectedChat) {
    return (
      <div className="chat-window">
        <div className="chat-content">
          <div className="content1 full-width">
            <div className="default-message">
              <h2>Khi đăng nhập Echo Web trên nhiều trình duyệt, mật khẩu sẽ không được lưu để đảm bảo an toàn.</h2>
              <p>Tải Echo PC để xem đầy đủ tin nhắn</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-content">
        <div className={`content1 ${!isInfoOpen ? "full-width" : ""}`}>
          <div className="header">
            <div className="avatar"></div>
            <div className="header-info">
              <h2>{selectedChat.name}</h2>
              <p
                style={{
                  color: selectedChat.trangthai === "online" ? "green" : "gray",
                  fontSize: "13px",
                }}
              >
                Truy cập {selectedChat.thoigiantruycap} trước
              </p>
            </div>
            <div className="header-icons">
              <span className="header-icon">
                <BsIcons.BsTelephoneFill />
              </span>
              <span className="header-icon">
                <BsIcons.BsCameraVideoFill />
              </span>
              <span className="header-icon">
                <FaIcons.FaSearch />
              </span>
              <span className="header-icon" onClick={toggleInfo}>
                <FaIcons.FaInfoCircle />
              </span>
            </div>
          </div>
          <div className="messages">
            {selectedChat.messages.map((message) => (
              <div
                key={message.id}
                className={`chat-message ${message.type}`}
              >
                <p>{message.content}</p>
                <span className="message-time">{message.time}</span>
              </div>
            ))}
            <div className="date-divider">04/07/2023</div>
            <div className="chat-message received">
              <div className="message-content">
                <p>Bạn và {selectedChat.name} đã trở thành bạn</p>
                <p>Chọn một sticker dưới đây để bắt đầu trò chuyện</p>
                <div className="stickers">
                  <div className="sticker">HI!!</div>
                  <div className="sticker">HELLO!!</div>
                  <div className="sticker">👋</div>
                </div>
              </div>
            </div>
          </div>
          <div className="chat-input">
            <div className="input-icons left">
              <FaIcons.FaSmile />
              <FaIcons.FaImage />
              <FaIcons.FaPaperclip />
              <FaIcons.FaLink />
              <FaIcons.FaMicrophone />
              <FaIcons.FaEllipsisH />
            </div>
            <input type="text" placeholder={`Nhập @, tin nhắn tơi ${selectedChat.name}`} />
            <div className="input-icons right">
              <FaIcons.FaSmile />
              <FaIcons.FaThumbsUp />
            </div>
          </div>
        </div>
        {isInfoOpen && (
          <div className="content2">
            <h2>Thông tin hội thoại</h2>
            <div className="chat-info">
              <div className="avatar"></div>
              <h3>{selectedChat.name}</h3>
            </div>
            <div className="info-section">
              <div className="info-header">
                <FaIcons.FaBell className="info-icon" />
                <h4>Danh sách nhắc hẹn</h4>
              </div>
              <p>Chưa có nhắc hẹn</p>
            </div>
            <div className="info-section">
              <div className="info-header">
                <FaIcons.FaImage className="info-icon" />
                <h4>Ảnh/Video</h4>
                <FaIcons.FaChevronDown className="chevron-icon" />
              </div>
              <p>Chưa có Ảnh/Video được chia sẻ trong hội thoại này</p>
            </div>
            <div className="info-section">
              <div className="info-header">
                <FaIcons.FaFileAlt className="info-icon" />
                <h4>File</h4>
                <FaIcons.FaChevronDown className="chevron-icon" />
              </div>
              <p>Chưa có File được chia sẻ trong hội thoại này</p>
            </div>
            <div className="info-section">
              <div className="info-header">
                <FaIcons.FaLink className="info-icon" />
                <h4>Link</h4>
                <FaIcons.FaChevronDown className="chevron-icon" />
              </div>
              <p>Chưa có Link được chia sẻ trong hội thoại này</p>
            </div>
            <div className="info-section">
              <div className="info-header">
                <FaIcons.FaLock className="info-icon" />
                <h4>Thiết lập bảo mật</h4>
                <FaIcons.FaChevronDown className="chevron-icon" />
              </div>
              <div className="setting-item">
                <div className="setting-label">
                  <FaIcons.FaClock className="setting-icon" />
                  <span>Tin nhắn tự xóa</span>
                </div>
                <span>Không bao giờ</span>
              </div>
              <div className="setting-item">
                <div className="setting-label">
                  <FaIcons.FaEyeSlash className="setting-icon" />
                  <span>Ẩn trò chuyện</span>
                </div>
                <label className="switch">
                  <input type="checkbox" />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
            <div className="info-section">
              <div className="info-header">
                <BiIcons.BiError className="info-icon" />
                <h4>Báo xấu</h4>
              </div>
            </div>
            <button className="delete-chat">
              <FaIcons.FaTrash className="delete-icon" />
              Xóa lịch sử trò chuyện
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;