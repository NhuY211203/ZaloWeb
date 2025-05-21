import React, { useState } from 'react';
import "../styles/PinnedMessageBar.css";
import { io } from 'socket.io-client';
const socket = io("http://localhost:5000");




const PinnedMessagesBar = ({ pinnedMessages, onUnpin,user }) => {
  const [showAll, setShowAll] = useState(false);
  const sendNotification = (content,chatID) => {
  if (!content.trim()) return;

  const tempID = Date.now().toString();

  const newNotification = {
    tempID,
    chatID: chatID,
    senderID: user.userID,
    content,
    type: "notification",
    timestamp: new Date().toISOString(),
    media_url: [],
    status: "sent",
     pinnedInfo: null,
    senderInfo: { name: user.name, avatar: user.anhDaiDien },
  };
  socket.emit("send_message", newNotification);
};

  const handleUnGhimMessage = (message) => {
    socket.emit("unghim_message", { chatID: message.chatID, messageID: message.messageID });
        // Gửi thông báo ngay sau khi emit thành công
    const content = `📌 ${user.name} đã bỏ ghim một tin nhắn.`;
    sendNotification(content,message.chatID);
    // Đóng modal sau một khoảng delay nhẹ (tùy thích)
    setTimeout(() => {
      onUnpin(message.messageID);
    }, 1000); // không cần delay quá lâu
    
  }

  if (!pinnedMessages || pinnedMessages.length === 0) return null;

  const messagesToShow = showAll ? pinnedMessages : [pinnedMessages[pinnedMessages.length - 1]];

  return (
    <div className="pinned-messages-container">
      <div className="pinned-header">
        📌 {pinnedMessages.length} tin nhắn đã ghim
       {pinnedMessages?.length > 1 && <button
            className="toggle-pinned-btn"
            onClick={() => setShowAll(!showAll)}
        >
            {showAll ? "⬆ Ẩn bớt" : "⬇ Hiển thị tất cả"}
        </button>}
     </div>

      {messagesToShow.map((msg, index) => {
        const { senderInfo, content, type, media_url, _id } = msg;
        return (
          <div key={_id || index} className="pinned-message-bar">
            <div className="pinned-left">
              {senderInfo?.avatar && (
                <img src={senderInfo.avatar} alt="avatar" className="pinned-avatar" />
              )}
              <div className="pinned-content">
                <span className="pinned-label">{senderInfo?.name || "Không rõ"}</span>
                <span className="pinned-text">
                  {type === "text" && content}
                  {type === "image" && "[Ảnh]"}
                  {type === "video" && "[Video]"}
                  {type === "audio" && "[Audio]"}
                  {type === "file" && "[Tệp tin]"}
                  {type === "unsend" && <i style={{ color: "gray" }}>Tin nhắn đã thu hồi</i>}
                </span>
              </div>
            </div>
            <button className="unpin-btn" onClick={() => handleUnGhimMessage(msg)}>❌</button>
          </div>
        );
      })}
    </div>
  );
};

export default PinnedMessagesBar;
