import React, { useState,useEffect,useRef} from "react";
import "../styles/ChatWindow.css";
import * as FaIcons from "react-icons/fa";
import * as BsIcons from "react-icons/bs";
import * as BiIcons from "react-icons/bi";
import EmojiPicker from "emoji-picker-react";
import { db } from "../config/firebase";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import ffmpeg from 'ffmpeg.js';
import { AudioRecorder } from 'react-audio-voice-recorder';
import { io } from 'socket.io-client';


const socket = io('https://cnm-service.onrender.com');
//const socket = io('http://localhost:5000');

const ChatWindow = ({ selectedChat,user }) => {
   const [isInfoOpen, setIsInfoOpen] = useState(true);
    const [messages, setMessages] = useState(""); // Tin nhắn nhập vào
    const [message, setMessage] = useState([]); // Danh sách tin nhắn
    const [saveImage, setSaveImage] = useState(false); // Trạng thái lưu ảnh/video
    const [files, setFiles] = useState([]); // Danh sách file
    const [showEmojiPicker, setShowEmojiPicker] = useState(false); // Hiển thị bảng chọn emoji
    const [isUploading, setIsUploading] = useState(false); // Trạng thái uploading
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null); // dùng để play
    const [visibleCount, setVisibleCount] = useState(10);
    const fileInputRef = useRef(null);
    const attachmentInputRef = useRef(null); // Ref cho input file đính kèm
    const bottomRef = useRef(null);
    const scrollContainerRef = useRef(null);


    
    


    // ham xu ly load them 10 tin nhan cu 
    const handleScroll = () => {
      const el = scrollContainerRef.current;
      if (el && el.scrollTop === 0 && visibleCount < message.length) {
        setVisibleCount((prev) => prev + 10);
      }
    };
    // Hàm xử lý khi ghi âm xong
    const handleAudioStop = (blob) => {
      const url = URL.createObjectURL(blob);
      setAudioBlob(blob);       // ✅ dùng để gửi lên server
      setAudioUrl(url);         // ✅ dùng để play audio
      console.log("Audio blob:", blob);
      console.log("Audio URL:", url);
    };
    
  const handleDeleteRecording = () => {
    setAudioBlob(null); // xoá bản ghi cũ
    setAudioUrl(null);  // xoá bản ghi cũ
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }, 100);
    return () => clearTimeout(timeout);
  }, []);
  
  
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);
  

  useEffect(() => {
    setMessage(selectedChat?.lastMessage || []);
  }, [selectedChat]);
  const sortedMessages = [...message].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const visibleMessages = sortedMessages.slice(-visibleCount); // lấy 10 tin nhắn mới nhất

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
  const sendVoiceMessage = async () => {
    if (!audioBlob) return;
  
    const formData = new FormData();
    formData.append("files", audioBlob, "voice-message.webm");
  
    const res = await fetch("https://cnm-service.onrender.com/api/upload", {
      method: "POST",
      body: formData,
    });
  
    if (!res.ok) throw new Error(`Server error: ${res.statusText}`);
    const data = await res.json();
    console.log("Audio upload response:", data);
    const tempID = Date.now().toString();
    const newMsg = {
      tempID,
      chatID: selectedChat.chatID,
      senderID: user.userID,
      content: '',
      type: 'audio',
      timestamp: new Date().toISOString(),
      media_url: data.urls,
      status: 'sent',
      senderInfo: { name: user.name, avatar: user.anhDaiDien },
    };
    socket.emit('send_message', newMsg);
    setMessage((prev) => [...prev, newMsg]);
  
    // Gửi tin nhắn hoặc xử lý tiếp ở đây
  
    setAudioBlob(null);
    setAudioUrl(null);
  };
  
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
  
  // Gửi file và video
    const sendSelectedFiles = async () => {
      if (!files.length) return;
  
      setIsUploading(true);
  
      const imageForm = new FormData();
      const videoForm = new FormData();
      const imageFiles = [];
      const videoFiles = [];
  
      files.forEach((file) => {
        if (file.type.startsWith("image")) {
          imageForm.append("files", file);
          imageFiles.push(file);
        } else if (file.type.startsWith("video")) {
          
              videoForm.append("files", file);
              videoFiles.push(file);  
          
        }
      });
  
      try {
        // Gửi ảnh
        if (imageFiles.length > 0) {
          const res = await fetch("https://echoapp-rho.vercel.app/api/upload", {
            method: "POST",
            body: imageForm,
          });
          if (!res.ok) throw new Error(`Server error: ${res.statusText}`);
          const data = await res.json();
          console.log("Image upload response:", data);
  
          const imageMsg = {
            tempID: Date.now().toString(),
            chatID: selectedChat.chatID,
            senderID: user.userID,
            content: "",
            type: "image",
            timestamp: new Date().toISOString(),
            media_url: data.urls,
            status: "sent",
            senderInfo: { name: user.name, avatar: user.anhDaiDien },
          };
  
          setMessage(prev => [...prev, imageMsg]); // <-- dùng emojiMsg ở đây
          socket.emit("send_message", imageMsg);   // <-- và cả ở đây
        }
  
        // Gửi video
        if (videoFiles.length > 0) {
          const res = await fetch("http://localhost:5000/api/upload", {
            method: "POST",
            body: videoForm,
          });
          if (!res.ok) throw new Error(`Server error: ${res.statusText}`);
          const data = await res.json();
  
          const videoMsg = {
            tempID: Date.now().toString(),
            chatID: selectedChat.chatID,
            senderID: user.userID,
            content: "",
            type: "video",
            timestamp: new Date().toISOString(),
            media_url: data.urls,
            status: "sent",
            senderInfo: { name: user.name, avatar: user.anhDaiDien },
          };
  
          setMessage(prev => [...prev, videoMsg]); // <-- dùng emojiMsg ở đây
          socket.emit("send_message", videoMsg);   // <-- và cả ở đây
        }
  
        setFiles([]);
        setSaveImage(false);
      } catch (error) {
        console.error("Upload error:", error);
        alert("Lỗi khi upload file: " + error.message);
      } finally {
        setIsUploading(false);
      }
    };
    const sendMessageObject = (msg) => {
      socket.emit("send_message", msg);
      setMessage(prev => [...prev, msg]);
    };
// Gửi emoji
const handleEmojiClick = async (emojiObject) => {
  const emoji = emojiObject.emoji;
  const tempID = Date.now().toString();
  const emojiMsg = {
    tempID,
    chatID: selectedChat.chatID,
    senderID: user.userID,
    content: emoji,
    type: "emoji",
    timestamp: new Date().toISOString(),
    media_url: [],
    status: "sent",
    senderInfo: { name: user.name, avatar: user.anhDaiDien },
  };
  console.log("emojiMsg:", emojiMsg);
  sendMessageObject(emojiMsg);
  setShowEmojiPicker(false);
};

  const toggleInfo = () => {
    setIsInfoOpen(!isInfoOpen);
  };

   
  
    const handleIconClick = () => {
      fileInputRef.current?.click();
    };
  
    const handleAttachmentClick = () => {
      attachmentInputRef.current?.click();
    };
    const handleFileChange = (event) => {
      const selectedFiles = Array.from(event.target.files);
      setFiles(selectedFiles);
      setSaveImage(true);
    };

    const handleDeleteFile = (index) => {
      const updatedFiles = files.filter((_, i) => i !== index);
      setFiles(updatedFiles);
      if (updatedFiles.length === 0) setSaveImage(false);
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
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            style={{
              height:"600px",
              overflowY: "auto",
            }}
            >   
            <div className="messages"> 
            
            {visibleMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
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
          ) : msg.type==="audio" ?(
            msg.media_url.map((audio, i) => (
              <audio 
                key={i}
                controls
                src={typeof audio === "string" ? audio : audio.uri}>
              </audio>
            ))
          ): (
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
            <div ref={bottomRef} /> 
          </div>
          </div> 
    
<div className="chat-input">
            <div className="input-icons left">
              <FaIcons.FaSmile
                size={24}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              />
              <button onClick={handleIconClick}>
                <FaIcons.FaImage size={24} />
              </button>
              <button onClick={handleAttachmentClick}>
                <FaIcons.FaPaperclip size={24} />
              </button>
              <FaIcons.FaLink size={24} />
              <div>
                <AudioRecorder
                  onRecordingComplete={(blob) => handleAudioStop(blob)}
                  audioTrackConstraints={{
                    noiseSuppression: true,
                    echoCancellation: true,
                  }}
                  downloadOnSavePress={false}
                  showVisualizer={true}
                />

                {audioUrl && (
                  <div style={{ marginTop: '1rem' }}>
                    <p>🎧 Ghi âm xong:</p>
                    <audio controls src={audioUrl}></audio>
                  </div>
                )}
                {audioUrl && (
                  <button onClick={handleDeleteRecording} className="bg-red-500 text-white px-4 py-2 rounded">
                    Xoá ghi âm
                  </button>
                )}


                
                {audioUrl && (
                  <button onClick={sendVoiceMessage} className="bg-red-500 text-white px-4 py-2 rounded">
                     Lưu ghi âm
                  </button>
                )}
              </div>
              <FaIcons.FaEllipsisH size={24} />
            </div>

            {showEmojiPicker && (
              <div className="emoji-picker">
                <EmojiPicker onEmojiClick={(emojiObject, event)=>{
                  handleEmojiClick(emojiObject);
                  console.log("Emoji selected:", emojiObject);

                }} />
              </div>
            )}

            {files.length > 0 && (
              <div className={`image-preview ${isUploading ? "upload-loading" : ""}`}>
                {files.map((file, index) => (
                  <div key={index} className="image-container">
                    {file.type.includes("video") ? (
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
                      onClick={() => handleDeleteFile(index)}
                      disabled={isUploading}
                    >
                      <FaIcons.FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input
              type="file"
              multiple
              accept="image/*"
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <input
              type="file"
              multiple
              accept="video/*,*/*"
              style={{ display: "none" }}
              ref={attachmentInputRef}
              onChange={handleFileChange}
            />
            <input
              type="text"
              placeholder={`Nhập @, tin nhắn tới ${selectedChat.name}`}
              value={messages}
              onChange={(e) => setMessages(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
            />
            <div className="input-icons right">
              {saveImage ? (
                <button onClick={sendSelectedFiles} disabled={isUploading}>
                  <FaIcons.FaPaperPlane size={24} />
                </button>
              ) : (
                <button onClick={sendMessage}>
                  <FaIcons.FaPaperPlane size={24} />
                </button>
              )}
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
