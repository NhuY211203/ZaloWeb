import React from "react";
import logo from "../assets/logo.png";
import nen from "../assets/nền.jpg";
import "../styles/ChatWindow.css";

const ChatWindow = ({ selectedChat }) => {
  return (
    <div className="chat-window">
      {selectedChat ? (
        <div className="chat-content">
          <div className="content1">
            <div className="header">
                <img src={selectedChat.avatar} alt="Avatar" className="avatar"/>
                <div>
                  <h2>{selectedChat.name}</h2>
                  <p style={
                    {
                      color: selectedChat.trangthai === "online" ? "green" : "gray",
                      fontSize: "13px"
                    }
                  }>Truy cập: {selectedChat.thoigiantruycap}</p>
                </div>
            </div>
            <div>
                <h2>{selectedChat.name}</h2>
                <p>{selectedChat.message}</p>
            </div>
          </div>
          <div className="content2">
              <div>
                <h2>Thông tin hội thoại</h2>
              </div>
          </div>
        </div>
      ) : (
        <div className="image-placeholder">
          <img className="hinh1" src={logo} alt="Chat Illustration" />
          <img className="hinh2" src={nen} alt="Chat Background" />
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
