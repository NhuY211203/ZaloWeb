
import React, { useState, useEffect, useRef } from "react";
import "../styles/ChatWindow.css";
import * as FaIcons from "react-icons/fa";
import * as BsIcons from "react-icons/bs";
import * as BiIcons from "react-icons/bi";
import EmojiPicker from "emoji-picker-react";
import { AudioRecorder } from "react-audio-voice-recorder";
import { io } from "socket.io-client";
import ChatInfo from "./ChatInfo"; 
import AddMemberGroup from "./AddMemberGroup";

const socket = io("http://localhost:5000");
//const socket = io('https://cnm-service.onrender.com');

const ChatWindow = ({ selectedChat, user ,onLeaveGroupSuccess}) => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
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
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [groupInfo, setGroupInfo] = useState(null);
  const [isEditingGroupName, setIsEditingGroupName] = useState(false);
  const fileInputRef = useRef(null);
  const attachmentInputRef = useRef(null);
  const bottomRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const groupImageInputRef = useRef(null);
  const [showActionModal, setShowActionModal] = useState(null); // Lưu ID tin nhắn để hiển thị modal
  const [selectedMessage, setSelectedMessage] = useState(null); // Lưu tin nhắn được chọn
  const [isSearchOpen, setIsSearchOpen] = useState(false); // State để mở/đóng giao diện tìm kiếm
  const [searchKeyword, setSearchKeyword] = useState(""); // State để lưu từ khóa tìm kiếm
  const [searchResults, setSearchResults] = useState([]); // State để lưu kết quả tìm kiếm
  console.log("📦 selectedChat:", selectedChat);
  // Xác định vai trò của người dùng (admin hoặc member)

  // Lấy thông tin nhóm từ server
  const fetchGroupInfo = async () => {
    if (!selectedChat?.chatID || selectedChat.type !== "group") return;

    try {
      const response = await fetch(`https://echoapp-rho.vercel.app/api/group/${selectedChat.chatID}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (response.ok) {
        setGroupInfo(data);
      } else {
        console.error("❌ Error fetching group info:", data.message);
      }
    } catch (error) {
      console.error("❌ Fetch failed:", error.message);
    }
  };

  useEffect(() => {
    if (selectedChat?.type === "group") {
      fetchGroupInfo();
    }
  }, [selectedChat]);

  // Lắng nghe sự kiện cập nhật nhóm qua socket
  useEffect(() => {
    socket.on("updateGroup", (updatedGroup) => {
      if (updatedGroup.chatID === selectedChat.chatID) {
        setGroupInfo(updatedGroup);
      }
    });

    return () => {
      socket.off("updateGroup");
    };
  }, [selectedChat]);

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
    if (!message) return;

    const images = [];
    const videos = [];
    const files = [];
    const links = [];

    message.forEach((msg) => {
      if (msg.type === "image" && msg.media_url) {
        // Đảm bảo rằng media_url luôn là mảng
        const mediaUrls = Array.isArray(msg.media_url) ? msg.media_url : [msg.media_url];
        mediaUrls.forEach((url, index) => {
          images.push({
            id: `${msg.tempID || msg._id}_${index}`,
            url: typeof url === "string" ? url : url.uri,
            timestamp: msg.timestamp,
          });
        });
      } else if (msg.type === "video" && msg.media_url) {
        // Xử lý video tương tự như ảnh
        const mediaUrls = Array.isArray(msg.media_url) ? msg.media_url : [msg.media_url];
        mediaUrls.forEach((url, index) => {
          videos.push({
            id: `${msg.tempID || msg._id}_${index}`,
            url: typeof url === "string" ? url : url.uri,
            timestamp: msg.timestamp,
          });
        });
      } else if (msg.type === "file" && msg.media_url) {
        // Xử lý tệp tin tương tự
        const mediaUrls = Array.isArray(msg.media_url) ? msg.media_url : [msg.media_url];
        mediaUrls.forEach((url, index) => {
          files.push({
            id: `${msg.tempID || msg._id}_${index}`,
            url: typeof url === "string" ? url : url.uri,
            name: msg.content || `file_${index}`,
            timestamp: msg.timestamp,
          });
        });
      } else if (msg.type === "link" && msg.content) {
        // Xử lý liên kết
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
      const res = await fetch("https://cnm-service.onrender.com/api/upload", {
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

    const imageForm = new FormData();
    const videoForm = new FormData();
    const fileForm = new FormData();

    const imageFiles = [];
    const videoFiles = [];
    const otherFiles = [];

    files.forEach((file) => {
      if (file.type.startsWith("image")) {
        imageForm.append("files", file);
        imageFiles.push(file);
      } else if (file.type.startsWith("video")) {
        videoForm.append("files", file);
        videoFiles.push(file);
      } else {
        fileForm.append("files", file);
        otherFiles.push(file);
      }
    });

    try {
      if (imageFiles.length > 0) {
        const res = await fetch("https://echoapp-rho.vercel.app/api/upload", {
          method: "POST",
          body: imageForm,
        });
        const data = await res.json();

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

        setMessage((prev) => [...prev, imageMsg]);
        socket.emit("send_message", imageMsg);
      }

      if (videoFiles.length > 0) {
        const res = await fetch("https://cnm-service.onrender.com/api/upload", {
          method: "POST",
          body: videoForm,
        });
        if (!res.ok) throw new Error(`Server error: ${res.statusText}`);
        const data = await res.json();

        data.urls.forEach((url) => {
          const videoMsg = {
            tempID: Date.now().toString(),
            chatID: selectedChat.chatID,
            senderID: user.userID,
            content: "",
            type: "video",
            timestamp: new Date().toISOString(),
            media_url: url,
            status: "sent",
            senderInfo: { name: user.name, avatar: user.anhDaiDien },
          };

          setMessage((prev) => [...prev, videoMsg]);
          socket.emit("send_message", videoMsg);
        });
      }

      if (otherFiles.length > 0) {
        const res = await fetch("https://echoapp-rho.vercel.app/api/upload", {
          method: "POST",
          body: fileForm,
        });

        if (!res.ok) throw new Error(`Server error: ${res.statusText}`);
        const data = await res.json();

        if (!data.urls || !Array.isArray(data.urls)) {
          const fileMsg = {
            tempID: Date.now().toString(),
            chatID: selectedChat.chatID,
            senderID: user.userID,
            content: otherFiles[0].name,
            type: "file",
            timestamp: new Date().toISOString(),
            media_url: data.urls,
            status: "sent",
            senderInfo: { name: user.name, avatar: user.anhDaiDien },
          };

          setMessage((prev) => [...prev, fileMsg]);
          socket.emit("send_message", fileMsg);
        } else {
          data.urls.forEach((url, i) => {
            const fileMsg = {
              tempID: Date.now().toString(),
              chatID: selectedChat.chatID,
              senderID: user.userID,
              content: otherFiles[i].name,
              type: "file",
              timestamp: new Date().toISOString(),
              media_url: url,
              status: "sent",
              senderInfo: { name: user.name, avatar: user.anhDaiDien },
            };

            setMessage((prev) => [...prev, fileMsg]);
            socket.emit("send_message", fileMsg);
          });
        }
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
    setSaveImage(true);
  };

  const handleDeleteFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    if (updatedFiles.length === 0) setSaveImage(false);
  };

  const handleAddMember = () => {
    setIsAddMemberModalOpen(true);
  };

  const handleCloseAddMemberModal = () => {
    setIsAddMemberModalOpen(false);
  };

  const handleRemoveMember = async (memberId) => {
    try {
      const response = await fetch(`https://echoapp-rho.vercel.app/api/removeMember/${selectedChat.chatID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, adminID: user.userID }),
      });
      const data = await response.json();
      if (response.ok) {
        setGroupInfo(data);
        socket.emit("updateGroup", data);
      } else {
        console.error("❌ Error removing member:", data.message);
      }
    } catch (error) {
      console.error("❌ Remove failed:", error.message);
    }
  };

  const handleUnsendMessage = (message) => {
    if (message._id || message.tempID) {
      socket.emit("unsend_message", {
        chatID: selectedChat.chatID,
        messageID: message._id || message.tempID,
        senderID: user.userID,
      });
      setShowActionModal(null); // Đóng modal sau khi thu hồi
    }
  };
  
  const handleDissolveGroup = async () => {
    try {
      const response = await fetch(`https://echoapp-rho.vercel.app/api/dissolveGroup/${selectedChat.chatID}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (response.ok) {
        console.log("✅ Group dissolved successfully");
      } else {
        console.error("❌ Error dissolving group:", data.message);
      }
    } catch (error) {
      console.error("❌ Dissolve failed:", error.message);
    }
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
              {selectedChat.type === "group" && (
                <img
                  src={selectedChat?.avatar || "https://cdn-icons-png.flaticon.com/512/9131/9131529.png"}
                  alt="group avatar"
                  className="avatar"
                />
              )}
            </div>

            <div className="header-info">
  <h2>{selectedChat.name}</h2>
  {/* Hiển thị số thành viên nếu là nhóm */}
  {selectedChat.type === "group" && (
    <p style={{ fontSize: "13px", color: "#666", margin: "2px 0 0 0" }}>
      {selectedChat.members?.length || 0} thành viên
    </p>
  )}
  {/* Hiển thị trạng thái chỉ khi không phải nhóm */}
  {selectedChat.type !== "group" && (
    <p
      style={{
        color: selectedChat.trangthai === "online" ? "green" : "gray",
        fontSize: "13px",
        margin: "2px 0 0 0",
      }}
    >
      Truy cập {selectedChat.thoigiantruycap || "chưa rõ"} trước
    </p>
  )}
</div>

          <div className="header-icons">
            <span className="header-icon">
              <BsIcons.BsTelephoneFill />
            </span>
            <span className="header-icon">
              <BsIcons.BsCameraVideoFill />
            </span>
            <span className="header-icon" onClick={() => { setIsSearchOpen(true); setIsInfoOpen(true); }}>
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
            {/* <div className="messages">
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
                        // Xử lý hình ảnh
                        (Array.isArray(msg.media_url) ? msg.media_url : [msg.media_url]).map((img, i) => (
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
                        // Xử lý video
                        (Array.isArray(msg.media_url) ? msg.media_url : [msg.media_url]).map((video, i) => (
                          <video
                            key={i}
                            src={typeof video === "string" ? video : video.uri}
                            className="chat-video"
                            controls
                          />
                        ))
                      ) : msg.type === "audio" ? (
                        // Xử lý âm thanh
                        (Array.isArray(msg.media_url) ? msg.media_url : [msg.media_url]).map((audio, i) => (
                          <audio
                            key={i}
                            controls
                            src={typeof audio === "string" ? audio : audio.uri}
                          />
                        ))
                      ) : msg.type === "file" ? (
                        // Xử lý tệp tin
                        (Array.isArray(msg.media_url) ? msg.media_url : [msg.media_url]).map((file, i) => {
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
                      ) : (
                        // Xử lý tin nhắn văn bản
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
              <div ref={bottomRef} /> */}

              <div className="messages">
                {visibleMessages.map((msg, index) => {
                  const isMine = msg.senderID === user.userID;
                  return (
                    <div
                      key={msg._id || index}
                      className={`message-row ${isMine ? "my-message" : "other-message"}`}
                      onMouseLeave={() => setShowActionModal(null)} // Đóng modal khi rời chuột
                    >
                      {!isMine && msg.senderInfo?.avatar && (
                        <img
                          src={msg.senderInfo.avatar}
                          alt="avatar"
                          className="avatar-small"
                        />
                      )}
                      <div className="message-bubble-wrapper">
                        <div className="message-bubble">
                          {msg.type === "unsend" ? (
                            <i style={{ color: "gray" }}>Tin nhắn đã được thu hồi</i>
                          ) : msg.type === "image" ? (
                            (Array.isArray(msg.media_url) ? msg.media_url : [msg.media_url]).map((img, i) => (
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
                            (Array.isArray(msg.media_url) ? msg.media_url : [msg.media_url]).map((video, i) => (
                              <video
                                key={i}
                                src={typeof video === "string" ? video : video.uri}
                                className="chat-video"
                                controls
                              />
                            ))
                          ) : msg.type === "audio" ? (
                            (Array.isArray(msg.media_url) ? msg.media_url : [msg.media_url]).map((audio, i) => (
                              <audio
                                key={i}
                                controls
                                src={typeof audio === "string" ? audio : audio.uri}
                              />
                            ))
                          ) : msg.type === "file" ? (
                            (Array.isArray(msg.media_url) ? msg.media_url : [msg.media_url]).map((file, i) => {
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
                          ) : (
                            <span className="message-text">{msg.content}</span>
                          )}

                          {isMine && msg.type !== "unsent" && (
                            <div className="status-text">
                              {msg.status === "read" ? "Đã xem" : "Đã gửi"}
                            </div>
                          )}
                        </div>
                        {isMine && msg.type !== "unsent" && (
                          <div className="message-actions">
                            <FaIcons.FaEllipsisH
                              className="action-icon"
                              size={16}
                              onClick={() => {
                                setShowActionModal(msg._id || index);
                                setSelectedMessage(msg);
                              }}
                            />
                            {showActionModal === (msg._id || index) && (
                              <div className="action-modal">
                                <button
                                  onClick={() => console.log("Trả lời tin nhắn:", msg)}
                                >
                                  Trả lời tin nhắn
                                </button>
                                <button
                                  onClick={() => console.log("Chuyển tiếp tin nhắn:", msg)}
                                >
                                  Chuyển tiếp tin nhắn
                                </button>
                                <button onClick={() => handleUnsendMessage(msg)}>
                                  Thu hồi tin nhắn
                                </button>
                              </div>
                            )}
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
        {/* <button onClick={() => setIsInfoOpen(!isInfoOpen)}>Toggle Info</button> */}

        {isInfoOpen && (
        <ChatInfo
          selectedChat={selectedChat}
          
          groupInfo={groupInfo}
          user={user}
          handleAddMember={handleAddMember}
          mediaImages={mediaImages}
          mediaVideos={mediaVideos}
          mediaFiles={mediaFiles}
          mediaLinks={mediaLinks}
          onLeaveGroupSuccess={onLeaveGroupSuccess}
          isSearchOpen={isSearchOpen}
          setIsSearchOpen={setIsSearchOpen}
          searchKeyword={searchKeyword}
          setSearchKeyword={setSearchKeyword}
          searchResults={searchResults}
          setSearchResults={setSearchResults}
        />
        )}
      </div>

      {/* {isAddMemberModalOpen && (
        <AddGroupModal
          isModalOpen={isAddMemberModalOpen}
          handleCloseModal={handleCloseAddMemberModal}
          user={user}
          chatID={selectedChat.chatID}
          mode="add"
          onGroupCreate={() => {}}
          onStartChat={() => {}}
          onMembersAdded={(updatedGroup) => {
            setGroupInfo(updatedGroup);
          }}
        />
      )} */}

      {isAddMemberModalOpen && (
        <AddMemberGroup
          isModalOpen={isAddMemberModalOpen}
          handleCloseModal={handleCloseAddMemberModal}
          user={user}
          chatID={selectedChat.chatID}
          groupInfo={groupInfo}
          onMembersAdded={(updatedGroup) => {
            setGroupInfo(updatedGroup);
          }}
        />
      )}

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