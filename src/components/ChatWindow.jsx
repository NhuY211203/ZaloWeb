import React, { useState, useEffect, useRef } from "react";
import "../styles/ChatWindow.css";
import * as FaIcons from "react-icons/fa";
import * as BsIcons from "react-icons/bs";
import * as BiIcons from "react-icons/bi";
import EmojiPicker from "emoji-picker-react";
import { AudioRecorder } from "react-audio-voice-recorder";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const ChatWindow = ({ selectedChat, user }) => {
  const [isInfoOpen, setIsInfoOpen] = useState(true);
  const [messages, setMessages] = useState("");
  const [message, setMessage] = useState([]);
  const [saveImage, setSaveImage] = useState(false);
  const [files, setFiles] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [mediaImages, setMediaImages] = useState([]);
  const [mediaVideos, setMediaVideos] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaLinks, setMediaLinks] = useState([]);
  const [previewMedia, setPreviewMedia] = useState(null);
  const fileInputRef = useRef(null);
  const attachmentInputRef = useRef(null);
  const bottomRef = useRef(null);
  const scrollContainerRef = useRef(null);


  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (el && el.scrollTop === 0 && visibleCount < message.length) {
      setVisibleCount((prev) => prev + 10);
    }
  };

  const handleAudioStop = (blob) => {
    const url = URL.createObjectURL(blob);
    setAudioBlob(blob);
    setAudioUrl(url);
  };

  const handleDeleteRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
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

  useEffect(() => {
    if (!selectedChat) return;
    socket.emit("read_messages", {
      chatID: selectedChat.chatID,
      userID: user.userID,
    });
  }, [selectedChat]);

  useEffect(() => {
    if (!selectedChat) return;
    socket.emit("join_chat", selectedChat.chatID);

    const handleNewMessage = (data) => {
      setMessage((prev) => {
        if (prev.find((msg) => msg.tempID === data.tempID)) return prev;
        return [...prev, data];
      });
      if (data.senderID !== user.userID) {
        socket.emit("read_messages", {
          chatID: selectedChat.chatID,
          userID: user.userID,
        });
      }
    };
    

    const handleStatusUpdate = ({ messageID, status }) => {
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
        prev.map((msg) => (msg.messageID === messageID ? { ...msg, type: "unsent" } : msg))
      );
    };

    socket.on(selectedChat.chatID, handleNewMessage);
    socket.on(`status_update_${selectedChat.chatID}`, handleStatusUpdate);
    socket.on(`unsend_${selectedChat.chatID}`, handleUnsendMessage);
    socket.on("unsend_notification", (updatedMessage) => {
      setMessage((prevMessages) =>
        prevMessages.map((m) =>
          m.messageID === updatedMessage.messageID ? { ...m, ...updatedMessage } : m
        )
      );
    });

    return () => {
      socket.off(selectedChat.chatID, handleNewMessage);
      socket.off(`status_update_${selectedChat.chatID}`, handleStatusUpdate);
      socket.off(`unsend_${selectedChat.chatID}`, handleUnsendMessage);
      socket.off("unsend_notification");
    };
  }, [selectedChat, user.userID]);

  useEffect(() => {
    if (!message.length) return;

    const images = [];
    const videos = [];
    const files = [];
    const links = [];

    message.forEach((msg) => {
      if (msg.type === "image" && msg.media_url) {
        images.push(
          ...msg.media_url.map((url, index) => ({
            id: `${msg.tempID || msg._id}_${index}`,
            url: typeof url === "string" ? url : url.uri,
            timestamp: msg.timestamp,
          }))
        );
      } else if (msg.type === "video" && msg.media_url) {
        videos.push(
          ...msg.media_url.map((url, index) => ({
            id: `${msg.tempID || msg._id}_${index}`,
            url: typeof url === "string" ? url : url.uri,
            timestamp: msg.timestamp,
          }))
        );
      } else if (msg.type === "file" && msg.media_url) {
        files.push(
          ...msg.media_url.map((url, index) => ({
            id: `${msg.tempID || msg._id}_${index}`,
            url: typeof url === "string" ? url : url.uri,
            name: msg.content || `file_${index}`,
            timestamp: msg.timestamp,
          }))
        );
      } else if (msg.type === "link" && msg.content) {
        links.push({
          id: msg.tempID || msg._id,
          url: msg.content,
          timestamp: msg.timestamp,
        });
      }
    });

    setMediaImages(images);
    setMediaVideos(videos);
    setMediaFiles(files);
    setMediaLinks(links);
  }, [message]);

  const openMediaPreview = (media) => {
    setPreviewMedia(media);
  };

  const closeMediaPreview = () => {
    setPreviewMedia(null);
  };

  const sendVoiceMessage = async () => {
    if (!audioBlob) return;

    const formData = new FormData();
    formData.append("files", audioBlob, "voice-message.webm");

    try {
      const res = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Server error: ${res.statusText}`);
      const data = await res.json();
      const tempID = Date.now().toString();
      const newMsg = {
        tempID,
        chatID: selectedChat.chatID,
        senderID: user.userID,
        content: "",
        type: "audio",
        timestamp: new Date().toISOString(),
        media_url: data.urls,
        status: "sent",
        senderInfo: { name: user.name, avatar: user.anhDaiDien },
      };
      socket.emit("send_message", newMsg);
      setMessage((prev) => [...prev, newMsg]);
      setAudioBlob(null);
      setAudioUrl(null);
    } catch (error) {
      console.error("Upload audio error:", error);
      alert("Lỗi khi upload audio: " + error.message);
    }
  };

  const sendMessage = () => {
    if (!messages.trim()) return;
    const tempID = Date.now().toString();
    const newMsg = {
      tempID,
      chatID: selectedChat.chatID,
      senderID: user.userID,
      content: messages,
      type: "text",
      timestamp: new Date().toISOString(),
      media_url: [],
      status: "sent",
      senderInfo: { name: user.name, avatar: user.anhDaiDien },
    };
    socket.emit("send_message", newMsg);
    setMessage((prev) => [...prev, newMsg]);
    setMessages("");
  };

  const sendSelectedFiles = async () => {
    if (!files.length) return;
  
    setIsUploading(true);
  
    // Các form data để upload nhiều loại file
    const imageForm = new FormData();
    const videoForm = new FormData();
    const fileForm = new FormData();
  
    // Tách các file theo loại
    const imageFiles = [];
    const videoFiles = [];
    const otherFiles = [];
  
    files.forEach((file) => {
      if (file.type.startsWith("image")) {
        imageForm.append("files", file); // Thêm vào form data của ảnh
        imageFiles.push(file);
      } else if (file.type.startsWith("video")) {
        videoForm.append("files", file);
        videoFiles.push(file);
      } else {
        fileForm.append("files", file); // Thêm vào form data của file khác
        otherFiles.push(file);
      }
    });
  
    try {
      // Gửi các file ảnh
      if (imageFiles.length > 0) {
        const res = await fetch("http://localhost:5000/api/upload", {
          method: "POST",
          body: imageForm,
        });
        //if (!res.ok) throw new Error(`Server error: ${res.statusText}`);
        const data = await res.json();
  
        // Tạo các tin nhắn cho ảnh
        
          const imageMsg = {
            tempID: Date.now().toString(),
            chatID: selectedChat.chatID,
            senderID: user.userID,
            content: "",
            type: "image",
            timestamp: new Date().toISOString(),
            media_url: data.urls, // URL của ảnh
            status: "sent",
            senderInfo: { name: user.name, avatar: user.anhDaiDien },
          };
  
          setMessage((prev) => [...prev, imageMsg]);
          socket.emit("send_message", imageMsg);
      
      }
  
      // Gửi các file video
      if (videoFiles.length > 0) {
        const res = await fetch("http://localhost:5000/api/upload", {
          method: "POST",
          body: videoForm,
        });
        if (!res.ok) throw new Error(`Server error: ${res.statusText}`);
        const data = await res.json();
  
        // Tạo các tin nhắn cho video
        data.urls.forEach((url) => {
          const videoMsg = {
            tempID: Date.now().toString(),
            chatID: selectedChat.chatID,
            senderID: user.userID,
            content: "",
            type: "video",
            timestamp: new Date().toISOString(),
            media_url: url, // URL của video
            status: "sent",
            senderInfo: { name: user.name, avatar: user.anhDaiDien },
          };
  
          setMessage((prev) => [...prev, videoMsg]);
          socket.emit("send_message", videoMsg);
        });
      }
  
      // Gửi các file khác (word, pdf, ... nếu có)
      if (otherFiles.length > 0) {
        try {
          const res = await fetch("http://localhost:5000/api/upload", {
            method: "POST",
            body: fileForm,
          });
      
          if (!res.ok) throw new Error(`Server error: ${res.statusText}`);
      
          const data = await res.json();
          console.log("File upload response:", data);
           
          // Check if the response contains the expected file URLs
          if (!data.fileUrls || !Array.isArray(data.fileUrls)) {
            const fileMsg = {
              tempID: Date.now().toString(),
              chatID: selectedChat.chatID,
              senderID: user.userID,
              content:otherFiles[0].name, // File name
              type: "file", // File type
              timestamp: new Date().toISOString(),
              media_url: data.urls, // URL of the uploaded file
              status: "sent", // Sent status
              senderInfo: { name: user.name, avatar: user.anhDaiDien },
            };
      
            setMessage((prev) => [...prev, fileMsg]);
            socket.emit("send_message", fileMsg); // Emit the message
          }else {
          // Create and send a message for each uploaded file
          data.fileUrls.forEach((url,i) => {
            const fileMsg = {
              tempID: Date.now().toString(),
              chatID: selectedChat.chatID,
              senderID: user.userID,
              content:otherFiles[i].name, // File name
              type: "file", // File type
              timestamp: new Date().toISOString(),
              media_url:url, // URL of the uploaded file
              status: "sent", // Sent status
              senderInfo: { name: user.name, avatar: user.anhDaiDien },
            };
      
            setMessage((prev) => [...prev, fileMsg]);
            socket.emit("send_message", fileMsg); // Emit the message
          });
        }
        } catch (error) {
          console.error("Upload error:", error);
          alert("Error uploading files: " + error.message);
        }
      }
      // Reset files sau khi upload
      setFiles([]);
      setSaveImage(false);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Lỗi khi upload file: " + error.message);
    } finally {
      setIsUploading(false); // Kết thúc quá trình upload
    }
  };
  

  const handleEmojiClick = (emojiObject) => {
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
    socket.emit("send_message", emojiMsg);
    setMessage((prev) => [...prev, emojiMsg]);
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
    console.log("Selected files:", selectedFiles);
    setSaveImage(true);
  };

  const handleDeleteFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    if (updatedFiles.length === 0) setSaveImage(false);
  };

  if (!selectedChat) {
    return (
      <div className="chat-window">
        <div className="chat-content">
          <div className="content1 full-width">
            <div className="default-message">
              <h2>
                Khi đăng nhập Echo Web trên nhiều trình duyệt, mật khẩu sẽ không được lưu để đảm bảo an toàn.
              </h2>
              <p>Tải Echo PC để xem đầy đủ tin nhắn</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sortedMessages = [...message].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );
  const visibleMessages = sortedMessages.slice(-visibleCount);

  return (
    <div className="chat-window">
      <div className="chat-content">
        <div className={`content1 ${!isInfoOpen ? "full-width" : ""}`}>
          <div className="header">
            <div>
              {selectedChat.type === "private" &&
                selectedChat.lastMessage?.find((msg) => msg.senderID !== user.userID) && (
                  <img
                    src={
                      selectedChat.lastMessage.find((msg) => msg.senderID !== user.userID)
                        ?.senderInfo?.avatar
                    }
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
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            style={{ height: "600px", overflowY: "auto" }}
          >
            <div className="messages">
              {visibleMessages.map((msg, index) => {
                const isMine = msg.senderID === user.userID;
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
                      {msg.type === "unsend" ? (
                        <i style={{ color: "gray" }}>Tin nhắn đã được thu hồi</i>
                      ) : msg.type === "image" ? (
                        msg.media_url?.map((img, i) => (
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
                      ) : msg.type === "audio" ? (
                        msg.media_url.map((audio, i) => (
                          <audio
                            key={i}
                            controls
                            src={typeof audio === "string" ? audio : audio.uri}
                          />
                        ))
                      ) : msg.type === "file" ? (
                        msg.media_url.map((file, i) => {
                          const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(file)}&embedded=true`;
                          return (
                            <div key={i} className="file-message">
                              <a
                                href={viewerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={msg.content}
                              >
                                {msg.content || `file_${i}`}
                              </a>
                            </div>
                          );
                        })
                      )
                       : (
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
                  <div style={{ marginTop: "1rem" }}>
                    <p>🎧 Ghi âm xong:</p>
                    <audio controls src={audioUrl} />
                  </div>
                )}
                {audioUrl && (
                  <button
                    onClick={handleDeleteRecording}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Xóa ghi âm
                  </button>
                )}
                {audioUrl && (
                  <button
                    onClick={sendVoiceMessage}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Gửi ghi âm
                  </button>
                )}
              </div>
              <FaIcons.FaEllipsisH size={24} />
            </div>
            {showEmojiPicker && (
              <div className="emoji-picker">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
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
                    ) : file.type.includes("image") ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt="preview"
                        className="preview-thumbnail"
                      />
                    ) : (
                      <div className="file-preview">{file.name}</div>
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
              accept="*/*"
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
              <div>
                {selectedChat.type === "private" &&
                  selectedChat.lastMessage?.find((msg) => msg.senderID !== user.userID) && (
                    <img
                      src={
                        selectedChat.lastMessage.find((msg) => msg.senderID !== user.userID)
                          ?.senderInfo?.avatar
                      }
                      alt="avatar"
                      className="avatar"
                    />
                  )}
              </div>
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
              {mediaImages.length > 0 || mediaVideos.length > 0 ? (
                <div className="media-grid">
                  {mediaImages.map((img) => (
                    <img
                      key={img.id}
                      src={img.url}
                      alt="media"
                      onClick={() => openMediaPreview({ type: "image", url: img.url })}
                    />
                  ))}
                  {mediaVideos.map((vid) => (
                    <video
                      key={vid.id}
                      src={vid.url}
                      onClick={() => openMediaPreview({ type: "video", url: vid.url })}
                    />
                  ))}
                </div>
              ) : (
                <p>Chưa có Ảnh/Video được chia sẻ trong hội thoại này</p>
              )}
              <button className="view-all">Xem tất cả</button>
            </div>
            <div className="info-section">
              <div className="info-header">
                <FaIcons.FaFileAlt className="info-icon" />
                <h4>File</h4>
                <FaIcons.FaChevronDown className="chevron-icon" />
              </div>
              {mediaFiles.length > 0 ? (
                mediaFiles.map((file) => (
                  <div key={file.id} className="file-item">
                    <img
                      src={
                        file.name.endsWith(".pdf")
                          ? "/pdf-icon.png"
                          : "/file-icon.png"
                      }
                      alt="file-icon"
                    />
                    <a href={file.url} download={file.name}>
                      {file.name}
                    </a>
                    <span>{new Date(file.timestamp).toLocaleDateString("vi-VN")}</span>
                  </div>
                ))
              ) : (
                <p>Chưa có File được chia sẻ trong hội thoại này</p>
              )}
              <button className="view-all">Xem tất cả</button>
            </div>
            <div className="info-section">
              <div className="info-header">
                <FaIcons.FaLink className="info-icon" />
                <h4>Link</h4>
                <FaIcons.FaChevronDown className="chevron-icon" />
              </div>
              {mediaLinks.length > 0 ? (
                mediaLinks.map((link) => (
                  <div key={link.id} className="link-item">
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      {link.url}
                    </a>
                    <span>{new Date(link.timestamp).toLocaleDateString("vi-VN")}</span>
                  </div>
                ))
              ) : (
                <p>Chưa có Link được chia sẻ trong hội thoại này</p>
              )}
              <button className="view-all">Xem tất cả</button>
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
                  <span className="slider" />
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
      {previewMedia && (
        <div className="media-preview-modal" onClick={closeMediaPreview}>
          <div className="media-preview-content">
            {previewMedia.type === "image" ? (
              <img src={previewMedia.url} alt="preview" />
            ) : (
              <video src={previewMedia.url} controls autoPlay />
            )}
            <button className="close-preview-btn" onClick={closeMediaPreview}>
              <FaIcons.FaTimes />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;