
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
import axios from "axios";
import PinnedMessageBar from "./PinnedMessageBar";
import PinnedMessagesBar from "./PinnedMessageBar";
import { data } from "autoprefixer";

const socket = io("https://cnm-service.onrender.com");
//const socket = io('https://cnm-service.onrender.com');

const ChatWindow = ({ selectedChat, user ,onLeaveGroupSuccess}) => {
  console.log("Selected chat-------------:", selectedChat);
  
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [messages, setMessages] = useState("");
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [message, setMessage] = useState([]);// tim kiem
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
  const [length, setLength] = useState(0);
  const [showActionModal, setShowActionModal] = useState(null); // Lưu ID tin nhắn để hiển thị modal
  const [selectedMessage, setSelectedMessage] = useState(null); // Lưu tin nhắn được chọn
  const [isSearchOpen, setIsSearchOpen] = useState(false); // State để mở/đóng giao diện tìm kiếm
  const [searchKeyword, setSearchKeyword] = useState(""); // State để lưu từ khóa tìm kiếm
  const [searchResults, setSearchResults] = useState([]); // State để lưu kết quả tìm kiếm
  const [selectedChatt,setSelectedChatt]= useState(selectedChat);
  const [member, setMember] = useState(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false); // State cho modal trả lời
  const [replyMessage, setReplyMessage] = useState(null); // Tin nhắn cần trả lời
  const handleReplyMessage = (msg) => {
    console.log("Selected message to reply:", msg);
    setReplyMessage(msg);
    setIsReplyModalOpen(true);
  };
  console.log("User in chat window:", member);
  const handleCloseReplyModal = () => {
    setIsReplyModalOpen(false);
    setReplyMessage(null);
  };
  useEffect(() => {
    setSelectedChatt(selectedChat);
    setLength(selectedChat?.members?.length);
  },[selectedChat]);

 
  const handleMember = async()=>{
    const memberID = selectedChatt.members.find((m) => m.userID !== user.userID)?.userID;
    try{
        const res = await axios.post("https://cnm-service.onrender.com/api/usersID", {
          
          userID: memberID
        });
          console.log("Member data--------------:", res.data);
          setMember(res.data);
      }
      catch (error) {
        console.error("Error fetching member data:", error);
      }
  }

  useEffect(() => {
  if (!selectedChatt || selectedChatt.type !== "private") return;
  const fetchMember = async () => {
    
      await handleMember();
    

  };
  fetchMember();
}, [selectedChatt]);



  
  
  // Xác định vai trò của người dùng (admin hoặc member)

  // Lấy thông tin nhóm từ server
  // const fetchGroupInfo = async () => {
  //   if (!selectedChat?.chatID || selectedChat.type !== "group") return;

  //   try {
  //     const response = await fetch(`https://echoapp-rho.vercel.app/api/group/${selectedChat.chatID}`, {
  //       method: "GET",
  //       headers: { "Content-Type": "application/json" },
  //     });
  //     const data = await response.json();
  //     if (response.ok) {
  //       setGroupInfo(data);
  //     } else {
  //       console.error("❌ Error fetching group info:", data.message);
  //     }
  //   } catch (error) {
  //     console.error("❌ Fetch failed:", error.message);
  //   }
  // };

  // useEffect(() => {
  //   if (selectedChat?.type === "group") {
  //     fetchGroupInfo();
  //   }
  // }, [selectedChat]);

  // Lắng nghe sự kiện cập nhật nhóm qua socket
  useEffect(() => {
    socket.on("updateGroup", (updatedGroup) => {
      if (updatedGroup.chatID === selectedChatt.chatID) {
        setGroupInfo(updatedGroup);
      }
    });

    return () => {
      socket.off("updateGroup");
    };
  }, [selectedChatt]);

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
    setMessage(selectedChatt?.lastMessage || []);
  }, [selectedChatt]);

  useEffect(() => {
    if (!selectedChatt) return;
    socket.emit("read_messages", {
      chatID: selectedChatt.chatID,
      userID: user.userID,
    });
  }, [selectedChatt]);

  useEffect(() => {
    if (!selectedChatt) return;
    socket.emit("join_user", user.userID);
    socket.emit("join_chat", selectedChatt.chatID);

    const handleNewMessage = (data) => {
      setMessage((prev) => {
        if (prev.find((msg) => msg.tempID === data.tempID)) return prev;
        return [...prev, data];
      });
      if (data.senderID !== user.userID) {
        socket.emit("read_messages", {
          chatID: selectedChatt.chatID,
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

    socket.on(selectedChatt.chatID, handleNewMessage);
    socket.on(`status_update_${selectedChatt.chatID}`, handleStatusUpdate);
    socket.on(`unsend_${selectedChatt.chatID}`, handleUnsendMessage);
    socket.on("unsend_notification", (updatedMessage) => {
      setMessage((prevMessages) =>
        prevMessages.map((m) =>
          m.messageID === updatedMessage.messageID ? { ...m, ...updatedMessage } : m
        )
      );
    });
     socket.on("status_update",(data) => {
      setMember(data);
    });
    socket.on("updatee_user", (updatedUser) => {
      setMember(updatedUser);
  setMessage((prevMessages) =>
    prevMessages.map((msg) => {
      if (msg.senderID === updatedUser.userID) {
        return {
          ...msg,
          senderInfo: {
            ...msg.senderInfo,
            name: updatedUser.name,
            avatar: updatedUser.anhDaiDien,
          },
        };
      }
      return msg;
    })
  );
});
  socket.on("update_user", (updatedUser) => {  
    setMessage((prevMessages) =>
      prevMessages.map((msg) => {
        if (msg.senderID === updatedUser.userID) {
          return {
            ...msg,
            senderInfo: {
              ...msg.senderInfo,
              name: updatedUser.name,
              avatar: updatedUser.anhDaiDien,
            },
          };
        }
        return msg;
      })
    );
  })
  socket.on("unghim_notification", (message) => {
    setPinnedMessages((prevPinned) =>
      prevPinned.filter((msg) => msg.messageID !== message.messageID)
    );
    setMessage((prevMessages) =>
      prevMessages.map((msg) =>
        msg.messageID === message.messageID ? { ...msg, pinnedInfo: null } : msg
      )
    );
  });
  socket.on("ghim_notification", (message) => {
    setPinnedMessages((prevPinned) => {
      const existingMessage = prevPinned.find((msg) => msg.messageID === message.messageID);
      if (existingMessage) {
        return prevPinned.map((msg) =>
          msg.messageID === message.messageID ? { ...msg, pinnedInfo: message.pinnedInfo } : msg
        );
      } else {
        return [...prevPinned, { ...message, pinnedInfo: message.pinnedInfo }];
      }
    });
    setMessage((prevMessages) =>
      prevMessages.map((msg) =>
        msg.messageID === message.messageID ? { ...msg, pinnedInfo: message.pinnedInfo } : msg
      )
    );
  });
  socket.on("updateChatmember",(data)=>{
    setLength(data.members.length);
    setSelectedChatt(data);
  });
  socket.on("updateChat",(data)=>{
    setSelectedChatt(data);
    setLength(data.members.length);
  });

  socket.on("updateMemberChattt",(data)=>{
    setSelectedChatt(data);
    setLength(data.members.length);
  });
  




    return () => {
      socket.off(selectedChat.chatID, handleNewMessage);
      socket.off(`status_update_${selectedChatt.chatID}`, handleStatusUpdate);
      socket.off(`unsend_${selectedChatt.chatID}`, handleUnsendMessage);
      socket.off("unsend_notification");
      socket.off("updatee_user");
      socket.off("status_update");
      socket.off("update_user");
      socket.off("unghim_notification");
      socket.off("updateChatmember");
      socket.off("updateChat");
      socket.off("updateMemberChattt");
      
    };
  }, [selectedChatt, user.userID]);
  useEffect(() => {
  if (!message || !Array.isArray(message)) return;

  const pinned = message.filter((msg) => msg.pinnedInfo);
  setPinnedMessages(pinned);
}, [message]);
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
  const sendVoiceMessagee = async () => {
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
      replyTo: replyMessage ? {
      messageID: replyMessage.messageID,
      senderName: replyMessage.senderID,
      content: replyMessage.content,
      type: replyMessage.type,
      media_url: replyMessage.media_url,
    } : null,
  };
      socket.emit("send_message", newMsg);
      setMessage((prev) => [...prev, newMsg]);
      setAudioBlob(null);
      setAudioUrl(null);
      handleCloseReplyModal(); // Đóng modal sau khi gửi
    } catch (error) {
      console.error("Upload audio error:", error);
      alert("Lỗi khi upload audio: " + error.message);
    }
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
        chatID: selectedChatt.chatID,
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
  const sendMessagee = () => {
  if (!messages.trim()) return;
  const tempID = Date.now().toString();
  const newMsg = {
    tempID,
    chatID: selectedChatt.chatID,
    senderID: user.userID,
    content: messages,
    type: "text",
    timestamp: new Date().toISOString(),
    media_url: [],
    status: "sent",
    senderInfo: { name: user.name, avatar: user.anhDaiDien },
    replyTo: replyMessage ? {
      messageID: replyMessage.messageID,
      senderName: replyMessage.senderID,
      content: replyMessage.content,
      type: replyMessage.type,
      media_url: replyMessage.media_url,
    } : null,
  };
  socket.emit("send_message", newMsg);
  setMessage((prev) => [...prev, newMsg]);
  setMessages("");
  handleCloseReplyModal(); // Đóng modal sau khi gửi
};
const handleEmojiClickk = (emojiObject) => {
    const emoji = emojiObject.emoji;
    const tempID = Date.now().toString();
    const emojiMsg = {
      tempID,
      chatID: selectedChatt.chatID,
      senderID: user.userID,
      content: emoji,
      type: "emoji",
      timestamp: new Date().toISOString(),
      media_url: [],
      status: "sent",
      pinnedInfo: null,
      senderInfo: { name: user.name, avatar: user.anhDaiDien },
    replyTo: replyMessage ? {
      messageID: replyMessage.messageID,
      senderName: replyMessage.senderID,
      content: replyMessage.content,
      type: replyMessage.type,
      media_url: replyMessage.media_url,
    } : null,
  };
  socket.emit("send_message", newMsg);
  setMessage((prev) => [...prev, newMsg]);
  setMessages("");
  handleCloseReplyModal(); // Đóng modal sau khi gửi
  setShowEmojiPicker(false);
  };

  const sendMessage = () => {
    if (!messages.trim()) return;
    const tempID = Date.now().toString();
    const newMsg = {
      tempID,
      chatID: selectedChatt.chatID,
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
  const sendSelectedFiless = async () => {
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
        const res = await fetch("https://cnm-service.onrender.com/api/upload", {
          method: "POST",
          body: imageForm,
        });
        const data = await res.json();

        const imageMsg = {
          tempID: Date.now().toString(),
          chatID: selectedChatt.chatID,
          senderID: user.userID,
          content: "",
          type: "image",
          timestamp: new Date().toISOString(),
          media_url: data.urls,
          status: "sent",
          senderInfo: { name: user.name, avatar: user.anhDaiDien },
            replyTo: replyMessage ? {
          messageID: replyMessage.messageID,
          senderName: replyMessage.senderID,
          content: replyMessage.content,
          type: replyMessage.type,
          media_url: replyMessage.media_url,
        } : null,
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
            chatID: selectedChatt.chatID,
            senderID: user.userID,
            content: "",
            type: "video",
            timestamp: new Date().toISOString(),
            media_url: url,
            status: "sent",
            senderInfo: { name: user.name, avatar: user.anhDaiDien },
            replyTo: replyMessage ? {
            messageID: replyMessage.messageID,
            senderName: replyMessage.senderID,
            content: replyMessage.content,
            type: replyMessage.type,
            media_url: replyMessage.media_url,
          } : null,
        };

          setMessage((prev) => [...prev, videoMsg]);
          socket.emit("send_message", videoMsg);
        });
      }

      if (otherFiles.length > 0) {
        const res = await fetch("https://cnm-service.onrender.com/api/upload", {
          method: "POST",
          body: fileForm,
        });

        if (!res.ok) throw new Error(`Server error: ${res.statusText}`);
        const data = await res.json();

        if (!data.urls || !Array.isArray(data.urls)) {
          const fileMsg = {
            tempID: Date.now().toString(),
            chatID: selectedChatt.chatID,
            senderID: user.userID,
            content: otherFiles[0].name,
            type: "file",
            timestamp: new Date().toISOString(),
            media_url: data.urls,
            status: "sent",
            senderInfo: { name: user.name, avatar: user.anhDaiDien },
          replyTo: replyMessage ? {
          messageID: replyMessage.messageID,
          senderName: replyMessage.senderID,
          content: replyMessage.content,
          type: replyMessage.type,
          media_url: replyMessage.media_url,
        } : null,
      };

          setMessage((prev) => [...prev, fileMsg]);
          socket.emit("send_message", fileMsg);
        } else {
          data.urls.forEach((url, i) => {
            const fileMsg = {
              tempID: Date.now().toString(),
              chatID: selectedChatt.chatID,
              senderID: user.userID,
              content: otherFiles[i].name,
              type: "file",
              timestamp: new Date().toISOString(),
              media_url: url,
              status: "sent",
              senderInfo: { name: user.name, avatar: user.anhDaiDien },
           replyTo: replyMessage ? {
      messageID: replyMessage.messageID,
      senderName: replyMessage.senderID,
      content: replyMessage.content,
      type: replyMessage.type,
      media_url: replyMessage.media_url,
    } : null,
  };

            setMessage((prev) => [...prev, fileMsg]);
            socket.emit("send_message", fileMsg);
          });
        }
      }

      setFiles([]);
      setSaveImage(false);
      handleCloseReplyModal();
    } catch (error) {
      console.error("Upload error:", error);
      alert("Lỗi khi upload file: " + error.message);
    } finally {
      setIsUploading(false);
    }
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
        const res = await fetch("https://cnm-service.onrender.com/api/upload", {
          method: "POST",
          body: imageForm,
        });
        const data = await res.json();

        const imageMsg = {
          tempID: Date.now().toString(),
          chatID: selectedChatt.chatID,
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
            chatID: selectedChatt.chatID,
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
        const res = await fetch("https://cnm-service.onrender.com/api/upload", {
          method: "POST",
          body: fileForm,
        });

        if (!res.ok) throw new Error(`Server error: ${res.statusText}`);
        const data = await res.json();

        if (!data.urls || !Array.isArray(data.urls)) {
          const fileMsg = {
            tempID: Date.now().toString(),
            chatID: selectedChatt.chatID,
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
              chatID: selectedChatt.chatID,
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
      chatID: selectedChatt.chatID,
      senderID: user.userID,
      content: emoji,
      type: "emoji",
      timestamp: new Date().toISOString(),
      media_url: [],
      status: "sent",
      pinnedInfo: null,
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
      const response = await fetch(`https://cnm-service.onrender.com/api/removeMember/${selectedChatt.chatID}`, {
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
  const sendNotification = (content) => {
  if (!content.trim()) return;

  const tempID = Date.now().toString();

  const newNotification = {
    tempID,
    chatID: selectedChatt.chatID,
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

  const handleUnsendMessage = (message) => {
    if (message.messageID) {
      socket.emit('unsend_message', { chatID: selectedChatt.chatID, messageID: message.messageID, senderID: user.userID })
      
      setShowActionModal(null); // Đóng modal sau khi thu hồi
    }
  };
  const handleGhimMessage = (message) => {
    if (message.messageID) {
      socket.emit('ghim_message', {
        chatID: selectedChatt.chatID,
        messageID: message.messageID,
        senderID: user.userID
      });

    // Gửi thông báo ngay sau khi emit thành công
    const content = `📌 ${user.name} đã ghim một tin nhắn.`;
    sendNotification(content);

    // Đóng modal sau một khoảng delay nhẹ (tùy thích)
    setTimeout(() => {
      setShowActionModal(null);
    }, 1000); // không cần delay quá lâu

       
    }
  }

  const handleDissolveGroup = async () => {
    try {
      const response = await fetch(`https://cnm-service.onrender.com/api/dissolveGroup/${selectedChatt.chatID}`, {
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


  if (!selectedChatt) {
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
              {selectedChatt.type === "private" &&(
                <img
                  src={member?.anhDaiDien || "https://cdn-icons-png.flaticon.com/512/9131/9131529.png"}
                  alt="avatar"
                  className="avatar" 
                /> 
                )}
              {selectedChatt.type === "group" && (
                <img
                  src={selectedChatt?.avatar || "https://cdn-icons-png.flaticon.com/512/9131/9131529.png"}
                  alt="group avatar"
                  className="avatar"
                />
              )}
            </div>

            <div className="header-info">
  <h2>{selectedChatt.name}</h2>
  {/* Hiển thị số thành viên nếu là nhóm */}
  {selectedChatt.type === "group" && (
    <p style={{ fontSize: "13px", color: "#666", margin: "2px 0 0 0" }}>
      {length || 0} thành viên
    </p>
  )}
  {/* Hiển thị trạng thái chỉ khi không phải nhóm */}
  {selectedChatt.type !== "group" && (
    <p
      style={{
        color: member?.trangThai === "online" ? "green" : "gray",
        fontSize: "13px",
        margin: "2px 0 0 0",
      }}
    >
      {member?.trangThai || "chưa rõ"}
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
          {pinnedMessages?.length > 0 && (
            <PinnedMessagesBar
              pinnedMessages={pinnedMessages}
              onUnpin={() => setPinnedMessages([])}
              user={user}
            />
          )}

          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            style={{ height: "600px", overflowY: "auto" }}

          >
            <div className="messages">
                {visibleMessages.map((msg, index) => {
                  // Hiển thị thông báo
                  if (msg.type === "notification") {
                    return (
                      <div key={msg._id || index} className="message-row notification-message">
                        <div className="notification-text">{msg.content}</div>
                      </div>
                    );
                  }
                  const isMine = msg.senderID === user.userID;
                  return (
                    <div
                      key={msg._id || index}
                      className={`message-row ${isMine ? "my-message" : "other-message"}`}
                      onMouseLeave={() => setShowActionModal(null)}
                    >
                      {!isMine && msg.senderInfo?.avatar && (
                        <img src={msg.senderInfo.avatar} alt="avatar" className="avatar-small" />
                      )}
                      <div className="message-bubble-wrapper" style={{ position: "relative" }}>
                        
                        <div className="message-bubble">
                        {msg?.replyTo  && (
                          <div className="reply-to">
                            <span className="reply-to-sender">
                              Trả lời  {msg.replyTo.senderID === user.userID ? 'Bạn' : msg.replyTo.senderInfo?.name || 'ai đó'}
                            </span>
                            <span className="reply-to-content">
                              {msg.replyTo?.type === "text" ? msg.replyTo?.content
                                : msg.replyTo?.type === "image" ? "[Image]"
                                : msg.replyTo?.type === "video" ? "[Video]"
                                : msg.replyTo?.type === "audio" ? "[Audio]"
                                : msg.replyTo?.type === "file"  ? "[File]"
                                : msg.replyTo?.type === "emoji" ? "[Emoji]"
                                : "[Unknown]"}
                            </span>
                          </div>
                        )}
                          {msg.type === "unsend" ? (
                            <span className="unsent-message">Tin nhắn đã được thu hồi</span>
                          ) : msg.type === "image" ? (
                            (Array.isArray(msg.media_url) ? msg.media_url : [msg.media_url]).map((img, i) => (
                              <img
                                key={i}
                                src={typeof img === "string" ? img : img.uri}
                                className="chat-image"
                                alt="media"
                                onClick={() => window.open(typeof img === "string" ? img : img.uri, "_blank")}
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
                              <audio key={i} controls src={typeof audio === "string" ? audio : audio.uri} />
                            ))
                          ) : msg.type === "file" ? (
                            (Array.isArray(msg.media_url) ? msg.media_url : [msg.media_url]).map((file, i) => {
                              const viewerUrl = `https://docs.google.com/viewer?url=${file}&embedded=true`;
                              return (
                                <div key={i} className="file-message">
                                  <a href={viewerUrl} target="_blank" rel="noopener noreferrer" download={msg.content}>
                                    {msg.content || `file_${i}`}
                                  </a>
                                </div>
                              );
                            })
                          ) : (
                            <span className="message-text">{msg.content}</span>
                          )}
                          {isMine && msg.type !== "unsend" && (
                            <div className="status-text">
                              {msg.status === "read" ? "Đã xem" : "Đã gửi"}
                            </div>
                          )}
                        </div>

                        {msg.type !== "unsend" && (
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
                                <button onClick={() => handleReplyMessage(msg)}>Trả lời tin nhắn</button>
                                <button onClick={() => handleGhimMessage(msg)}>Ghim tin nhắn</button>
                                {isMine && <button onClick={() => handleUnsendMessage(msg)}>Thu hồi tin nhắn</button>}
                                
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {isMine && msg.senderInfo?.avatar && (
                        <img src={msg.senderInfo.avatar} alt="avatar" className="avatar-small" />
                      )}
                    </div>
                  );

                })}
                <div ref={bottomRef} />
              </div>
          </div>

          <div className="chat-input">
            {isReplyModalOpen && replyMessage && (
            <div className="reply-modal">
              <div className="reply-header">
                <span>Trả lời {replyMessage.senderInfo?.name || "Unknown"}</span>
                <FaIcons.FaTimes className="close-reply" onClick={handleCloseReplyModal} />
              </div>
              <div className="reply-content">
                <span>{replyMessage.content || "Tin nhắn không có nội dung"}</span>
              </div>
            </div>
          )}
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
                    onClick={() => {if(isReplyModalOpen){
                      sendVoiceMessagee();
                    }else{
                      sendVoiceMessage();
                    }}}
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
                <EmojiPicker onEmojiClick={() => {if (isAddMemberModalOpen){
                  handleEmojiClickk();
                }else{
                   handleEmojiClick();
                 } }} />
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
              placeholder={`Nhập @, tin nhắn tới ${selectedChatt.name}`}
              value={messages}
              onChange={(e) => setMessages(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  if (isReplyModalOpen){
                    sendMessagee();
                  }else{
                    sendMessage();
                  }
                }
              }}
            />
            <div className="input-icons right">
              {saveImage ? (
                <button onClick={()=>{if (isReplyModalOpen){
                  sendSelectedFiless();
                } else{
                 sendSelectedFiles();
                }
                 }} disabled={isUploading}>
                  <FaIcons.FaPaperPlane size={24} />
                </button>
              ) : (
                <button onClick={()=>{if (isReplyModalOpen){
                  sendMessagee();
                }
                else{
                  sendMessage();  
                }
                }}>
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
          selectedChat={selectedChatt}
          
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
          chatID={selectedChatt.chatID}
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