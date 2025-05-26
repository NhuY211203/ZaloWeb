import React, { useState, useRef, useEffect } from "react";

const servers = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideoCallModal({ isOpen, onClose, callUserId }) {
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const peerConnection = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    let stream;

    async function startCall() {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideo.current) localVideo.current.srcObject = stream;

      peerConnection.current = new RTCPeerConnection(servers);
      stream.getTracks().forEach((track) => peerConnection.current.addTrack(track, stream));

      peerConnection.current.ontrack = (event) => {
        if (remoteVideo.current) {
          remoteVideo.current.srcObject = event.streams[0];
        }
      };

      // TODO: Tạo offer, gửi offer, nhận answer, ice candidates qua signaling server...

      // Đây là ví dụ demo nên chưa kết nối thật.
    }

    startCall();

    return () => {
      // Dọn dẹp khi đóng modal
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>Cuộc gọi với {callUserId}</h3>
        <div style={styles.videoContainer}>
          <video ref={localVideo} autoPlay muted style={styles.localVideo} />
          <video ref={remoteVideo} autoPlay style={styles.remoteVideo} />
        </div>
        <button onClick={onClose} style={styles.endCallButton}>Kết thúc cuộc gọi</button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
    backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center",
    zIndex: 9999,
  },
  modal: {
    width: 400, backgroundColor: "#fff", padding: 20, borderRadius: 10, textAlign: "center",
  },
  videoContainer: {
    display: "flex", justifyContent: "space-between", marginTop: 10,
  },
  localVideo: {
    width: 150, height: 100, backgroundColor: "#000",
  },
  remoteVideo: {
    width: 220, height: 150, backgroundColor: "#000",
  },
  endCallButton: {
    marginTop: 15, padding: "8px 20px", backgroundColor: "red", color: "#fff", border: "none", borderRadius: 5,
    cursor: "pointer",
  }
};
