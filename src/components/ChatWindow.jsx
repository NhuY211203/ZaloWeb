import React, { useState,useEffect,useRef} from "react";
import "../styles/ChatWindow.css";
import * as FaIcons from "react-icons/fa";
import * as BsIcons from "react-icons/bs";
import * as BiIcons from "react-icons/bi";
import { io } from 'socket.io-client';

const socket = io('https://cnm-service.onrender.com');

const ChatWindow = ({ selectedChat,user }) => {
  const [isInfoOpen, setIsInfoOpen] = useState(true);
  console.log("chat:",selectedChat);
  const [messages, setMessages] = useState(""); // State to hold messages
  const [message, setMessage] = useState([]); // State to hold the current message input
  const [saveImage,setSaveImage] = useState(false); // State to hold images
  const [files, setFiles] = useState([]); // State to hold files
  const [typeFile, setTypeFile] = useState(""); // State to hold links
  const [sticker, setSticker] = useState(""); // State to hold the current sticker input
  useEffect(() => {
    setMessage(selectedChat?.lastMessage || []);
  }, [selectedChat]);
  useEffect(() => {
    if (!selectedChat) return;
    socket.emit('read_messages', { chatID: selectedChat.chatID, userID: user.userID });
  }, [selectedChat]);

  useEffect(() => {
    if (!selectedChat) return;
    socket.emit('join_chat', selectedChat.chatID);

    const handleNewMessage = (data) => {
      setMessage((prev) => {
        if (prev.find((msg) => msg.tempID === data.tempID)) return prev;
        return [...prev, data];
      });
      if (data.senderID !== user.userID) {
        socket.emit('read_messages', { chatID: selectedChat.chatID, userID: user.userID });
      }
    };

    const handleStatusUpdate = ({ messageID, status, userID: statusUserID }) => {
      setMessage((prev) =>
        prev.map((msg) => {
          if ((msg.tempID === messageID || msg._id === messageID) && msg.status !== status) {
            return { ...msg, status };
          }
          return msg;
        })
      );
    };

    const handleUnsendMessage = ({ messageID }) => {
      setMessage((prev) =>
        prev.map((msg) => (msg.messageID === messageID ? { ...msg, type: 'unsent' } : msg))
      );
    };

    socket.on(selectedChat.chatID, handleNewMessage);
    socket.on(`status_update_${selectedChat.chatID}`, handleStatusUpdate);
    socket.on(`unsend_${selectedChat.chatID}`, handleUnsendMessage);

    return () => {
      socket.off(selectedChat.chatID, handleNewMessage);
      socket.off(`status_update_${selectedChat.chatID}`, handleStatusUpdate);
      socket.off(`unsend_${selectedChat.chatID}`, handleUnsendMessage);
    };
  }, [selectedChat, user.userID]);

  const sendMessage = () => {
    if (!messages.trim()) return;
    const tempID = Date.now().toString();
    const newMsg = {
      tempID,
      chatID: selectedChat.chatID,
      senderID: user.userID,
      content: messages,
      type: 'text',
      timestamp: new Date().toISOString(),
      media_url: [],
      status: 'sent',
      senderInfo: { name: user.name, avatar: user.anhDaiDien },
    };
    socket.emit('send_message', newMsg);
    setMessage((prev) => [...prev, newMsg]);
    setMessages('');
  };
  
  const sendSelectedImages = async () => {
    if (!files.length) return;
  
    const imageForm = new FormData();
    const videoForm = new FormData();
  
    const imageFiles = [];
    const videoFiles = [];
  
    // Phân loại files
    files.forEach(file => {
      if (file.type.startsWith("image")) {
        imageForm.append("files", file);
        imageFiles.push(file);
      } else if (file.type.startsWith("video")) {
        videoForm.append("files", file);
        videoFiles.push(file);
      }
    });
    console.log("imageFiles:",imageFiles);
    console.log("videoFiles:",videoFiles);
  
    try {
      // Gửi ảnh
      if (imageFiles.length > 0) {
        const res = await fetch("https://echoapp-rho.vercel.app/api/upload", {
          method: "POST",
          body: imageForm,
        });
        if (!res.ok) {
          throw new Error(`Server error: ${res.statusText}`);
        }
        const data = await res.json();
  
        const imageMsg = {
          tempID: Date.now().toString(),
          chatID: selectedChat.chatID,
          senderID: user.userID,
          content: '',
          type: 'image',
          timestamp: new Date().toISOString(),
          media_url: data.urls,
          status: 'sent',
          senderInfo: { name: user.name, avatar: user.anhDaiDien },
        };
  
        setMessage(prev => [...prev, imageMsg]);
        socket.emit("send_message", imageMsg);
      }
  
      // Gửi video
      if (videoFiles.length > 0) {
        const res = await fetch("https://cnm-service.onrender.com/api/upload", {
          method: "POST",
          body: videoForm,
        });
        if (!res.ok) {
          throw new Error(`Server error: ${res.status} - ${res.statusText}`);
        }
        const data = await res.json();
  
        const videoMsg = {
          tempID: Date.now().toString(),
          chatID: selectedChat.chatID,
          senderID: user.userID,
          content: '',
          type: 'video',
          timestamp: new Date().toISOString(),
          media_url: data.urls,
          status: 'sent',
          senderInfo: { name: user.name, avatar: user.anhDaiDien },
        };
  
        setMessage(prev => [...prev, videoMsg]);
        socket.emit("send_message", videoMsg);
      }
  
      // Clear sau khi gửi xong
      setFiles([]);
      setSaveImage(false);
    } catch (error) {
      console.error("Upload error:", error);
    }
  };
  const toggleInfo = () => {
    setIsInfoOpen(!isInfoOpen);
  };

    const fileInputRef = useRef(null);
  
    const handleIconClick = () => {
      fileInputRef.current?.click();
    };
  
    const handleFileChange = (event) => {
      const files = Array.from(event.target.files);
    
      const docs = files.map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
      }));
      setFiles(files);
      setSaveImage(true);
      console.log('Tài liệu đã chọn:', docs);
      console.log('Tài liệu đã chọn:', files);

    };
    const handleDeleteImage = (index) => {
      // Xóa ảnh tại vị trí index
      const updatedFiles = files.filter((_, i) => i !== index);
      setFiles(updatedFiles);
  
      // Nếu không còn ảnh, hiển thị lại nút "Chọn ảnh"
      if (updatedFiles.length === 0) {
        setSaveImage(false);
      }
    };
  console.log("message:",message);

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
            <div >
            {selectedChat.type === "private" && selectedChat.lastMessage?.find((msg) => msg.senderID !== user.userID) && (
              <img
                key={selectedChat.lastMessage.find(msg => msg.senderID !== user.userID)?._id}
                src={selectedChat.lastMessage.find(msg => msg.senderID !== user.userID)?.senderInfo?.avatar}
                alt="avatar"
                className="avatar"
              />
            )}
            </div>
            <div className="header-info">
              <h2>{selectedChat.name}</h2>
              <p
                style={{
                  color: selectedChat.trangthai === "online" ? "green" : "gray",
                  fontSize: "13px",
                }}
              >
                Truy cập {selectedChat.thoigiantruycap || "chưa rõ"} trước
              </p>
            </div>
            <div className="header-icons">
              <span className="header-icon"><BsIcons.BsTelephoneFill /></span>
              <span className="header-icon"><BsIcons.BsCameraVideoFill /></span>
              <span className="header-icon"><FaIcons.FaSearch /></span>
              <span className="header-icon" onClick={toggleInfo}><FaIcons.FaInfoCircle /></span>
            </div>
          </div>

          <div className="messages">
  {message.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .map((msg, index) => {
      const isMine = msg.senderID === user.userID; // 👈 Bạn cần truyền thêm `currentUserID` nếu chưa có
      return (
        <div
          key={msg._id || index}
          className={`message-row ${isMine ? "my-message" : "other-message"}`}
        >
          {!isMine && msg.senderInfo?.avatar && (
            <img
              src={msg.senderInfo.avatar}
              alt="avatar"
              className="avatar-small"
            />
          )}

          <div className="message-bubble">
          {msg.type === "unsent" ? (
  <i style={{ color: "gray" }}>Tin nhắn đã được thu hồi</i>
) : msg.type === "image" ? (
  msg.media_url.map((img, i) => (
    <img
      key={i}
      src={typeof img === "string" ? img : img.uri}
      className="chat-image"
      alt="media"
      onClick={() =>
        window.open(typeof img === "string" ? img : img.uri, "_blank")
      }
    />
  ))
) : msg.type === "video" ? (
  msg.media_url.map((video, i) => (
    <video
      key={i}
      src={typeof video === "string" ? video : video.uri}
      className="chat-video"
      controls
    />
  ))
) : (
  <span className="message-text">{msg.content}</span>
)}
            {isMine && msg.type !== "unsent" && (
              <div className="status-text">
                {msg.status === "read" ? "Đã xem" : "Đã gửi"}
              </div>
            )}
          </div>

          {isMine && msg.senderInfo?.avatar && (
            <img
              src={msg.senderInfo.avatar}
              alt="avatar"
              className="avatar-small"
            />
          )}
        </div>
      );
    })}

  {/* Optional: Divider để đánh dấu ngày hoặc sự kiện */}
  {/* <div className="date-divider">{new Date().toLocaleDateString("vi-VN")}
  </div> */}
  {/* <div className="chat-message received">
    <div className="message-content">
      <p>Bạn và {selectedChat.name} đã trở thành bạn</p>
      <p>Chọn một sticker dưới đây để bắt đầu trò chuyện</p>
      <div className="stickers">
        <div className="sticker">HI!!</div>
        <div className="sticker">HELLO!!</div>
        <div className="sticker">👋</div>
      </div>
    </div>
  </div> */}
</div>

          <div className="chat-input">
            <div className="input-icons left">
              <FaIcons.FaSmile size={24} />
              {!saveImage &&( 
                <button onClick={handleIconClick}>
                  <FaIcons.FaImage size={24} />
                </button>)}
              {saveImage &&(
                <button onClick={sendSelectedImages}>
                <FaIcons.FaPaperPlane size={24} />
                </button>
              )}
              <FaIcons.FaPaperclip size={24} />
              <FaIcons.FaLink size={24} />
              <FaIcons.FaMicrophone size={24} />
              <FaIcons.FaEllipsisH size={24}/>
            </div>
            {files.length > 0 && (
          <div className="image-preview">
            {files.map((file, index) => (
              <div key={index} className="image-container">
                {/* Kiểm tra nếu là video */}
                {file.type.includes('video') ? (
                  <video
                    width="100"
                    height="100"
                    controls
                    src={URL.createObjectURL(file)}
                    className="preview-thumbnail"
                  />
                ) : (
                  <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className="preview-thumbnail"
                  />
                )}
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteImage(index)} // Xóa ảnh
                >
                  <FaIcons.FaTimes /> {/* Icon "X" để xóa ảnh */}
                </button>
              </div>
            ))}
          </div>
        )}
            <input
              type="file"
              multiple
              accept="*"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <input 
            type="text" 
            placeholder={`Nhập @, tin nhắn tới ${selectedChat.name}`} 
            value={messages} 
            onChange={(e) => setMessages(e.target.value)} />
            <div className="input-icons right">
            <button onClick={sendMessage}>
              <FaIcons.FaPaperPlane size={24} />
            </button>
              <FaIcons.FaThumbsUp size={24} />
            </div>
          </div>
        </div>

        {isInfoOpen && (
          <div className="content2">
            <h2>Thông tin hội thoại</h2>
            <div className="chat-info">
              <div >
              {selectedChat.type === "private" && selectedChat.lastMessage?.find((msg) => msg.senderID !== user.userID) && (
              <img
                key={selectedChat.lastMessage.find(msg => msg.senderID !== user.userID)?._id}
                src={selectedChat.lastMessage.find(msg => msg.senderID !== user.userID)?.senderInfo?.avatar}
                alt="avatar"
                className="avatar"
              />
            )}
              </div>
              <h3>{selectedChat.name}</h3>
            </div>
            <div className="info-section">
              <div className="info-header"><FaIcons.FaBell className="info-icon" /><h4>Danh sách nhắc hẹn</h4></div>
              <p>Chưa có nhắc hẹn</p>
            </div>
            <div className="info-section">
              <div className="info-header">
                <FaIcons.FaImage className="info-icon" /><h4>Ảnh/Video</h4>
                <FaIcons.FaChevronDown className="chevron-icon" />
              </div>
              <p>Chưa có Ảnh/Video được chia sẻ trong hội thoại này</p>
            </div>
            <div className="info-section">
              <div className="info-header">
                <FaIcons.FaFileAlt className="info-icon" /><h4>File</h4>
                <FaIcons.FaChevronDown className="chevron-icon" />
              </div>
              <p>Chưa có File được chia sẻ trong hội thoại này</p>
            </div>

            <div className="info-section">
              <div className="info-header">
                <FaIcons.FaLink className="info-icon" /><h4>Link</h4>
                <FaIcons.FaChevronDown className="chevron-icon" />
              </div>
              <p>Chưa có Link được chia sẻ trong hội thoại này</p>
            </div>

            <div className="info-section">
              <div className="info-header">
                <FaIcons.FaLock className="info-icon" /><h4>Thiết lập bảo mật</h4>
                <FaIcons.FaChevronDown className="chevron-icon" />
              </div>
              <div className="setting-item">
                <div className="setting-label"><FaIcons.FaClock className="setting-icon" /><span>Tin nhắn tự xóa</span></div>
                <span>Không bao giờ</span>
              </div>
              <div className="setting-item">
                <div className="setting-label"><FaIcons.FaEyeSlash className="setting-icon" /><span>Ẩn trò chuyện</span></div>
                <label className="switch">
                  <input type="checkbox" />
                  <span className="slider"></span>
                </label>
              </div>
            </div>

            <div className="info-section">
              <div className="info-header"><BiIcons.BiError className="info-icon" /><h4>Báo xấu</h4></div>
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
