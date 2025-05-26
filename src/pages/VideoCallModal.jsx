import React, { useState, useRef, useEffect } from "react";

const servers = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideoCallModal({ isOpen, onClose, callUserId, currentUserId, socket }) {
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const peerConnection = useRef(null);
  const localStream = useRef(null);
  const [hasReceivedAnswer, setHasReceivedAnswer] = useState(false);

  useEffect(() => {
    if (!isOpen || !socket || !callUserId) return;

    const startCall = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStream.current = stream;
        if (localVideo.current) localVideo.current.srcObject = stream;

        peerConnection.current = new RTCPeerConnection(servers);

        // Gửi track
        stream.getTracks().forEach(track => peerConnection.current.addTrack(track, stream));

        // Nhận track
        peerConnection.current.ontrack = (event) => {
          if (remoteVideo.current) {
            remoteVideo.current.srcObject = event.streams[0];
          }
        };

        // Gửi ICE
        peerConnection.current.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice-candidate", {
              to: callUserId,
              candidate: event.candidate,
            });
          }
        };

        // Tạo offer và gửi đi
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);

        socket.emit("call-user", {
          offer,
          to: callUserId,
          from: currentUserId,
        });

      } catch (error) {
        console.error("Error starting call:", error);
      }
    };

    startCall();

    // Lắng nghe answer
    socket.on("answer-made", async ({ answer }) => {
      if (!hasReceivedAnswer && peerConnection.current) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        setHasReceivedAnswer(true);
      }
    });

    // Lắng nghe ICE candidate
    socket.on("ice-candidate", async ({ candidate }) => {
      if (peerConnection.current) {
        try {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding ice candidate", err);
        }
      }
    });

    return () => {
      // Dọn dẹp
      socket.off("answer-made");
      socket.off("ice-candidate");

      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }

      if (localStream.current) {
        localStream.current.getTracks().forEach(track => track.stop());
        localStream.current = null;
      }
    };
  }, [isOpen, socket, callUserId, currentUserId, hasReceivedAnswer]);

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
