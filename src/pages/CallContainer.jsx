import React, { useState, useEffect, useRef } from "react";
import IncomingCallModal from "./IncomingCallModal";

const servers = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function CallContainer({ socket, currentUserId }) {
  const [incomingCall, setIncomingCall] = useState(null); // { from, offer }
  const [inCall, setInCall] = useState(false);

  const peerConnection = useRef(null);
  const localStream = useRef(null);
  const remoteVideo = useRef(null);
  const localVideo = useRef(null);

  // Đăng ký ID với socket server
  useEffect(() => {
    if (currentUserId) {
      socket.emit("register", currentUserId);
    }
  }, [socket, currentUserId]);

  useEffect(() => {
    const handleCallMade = async ({ from, offer }) => {
      console.log("Cuộc gọi đến từ:", from);
      setIncomingCall({ from, offer });
    };

    const handleIceCandidate = async ({ candidate }) => {
      if (peerConnection.current && candidate) {
        try {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error("Lỗi khi thêm ICE candidate", error);
        }
      }
    };

    const handleAnswerMade = async ({ answer }) => {
      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    };

    const handleEndCall = () => {
      endCall();
    };

    socket.on("call-made", handleCallMade);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("answer-made", handleAnswerMade);
    socket.on("end-call", handleEndCall);

    return () => {
      socket.off("call-made", handleCallMade);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("answer-made", handleAnswerMade);
      socket.off("end-call", handleEndCall);
    };
  }, [socket]);

  const acceptCall = async () => {
    if (!incomingCall) return;
    const { from, offer } = incomingCall;
    setIncomingCall(null);
    setInCall(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStream.current = stream;
      if (localVideo.current) localVideo.current.srcObject = stream;

      peerConnection.current = new RTCPeerConnection(servers);

      stream.getTracks().forEach(track => peerConnection.current.addTrack(track, stream));

      peerConnection.current.ontrack = (event) => {
        if (remoteVideo.current) {
          remoteVideo.current.srcObject = event.streams[0];
        }
      };

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate && from) {
          socket.emit("ice-candidate", {
            to: from,
            candidate: event.candidate,
          });
        }
      };

      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);

      socket.emit("make-answer", {
        to: from,
        answer,
      });
    } catch (error) {
      console.error("Lỗi khi chấp nhận cuộc gọi:", error);
      endCall();
    }
  };

  const rejectCall = () => {
    if (incomingCall?.from) {
      socket.emit("reject-call", { to: incomingCall.from });
    }
    setIncomingCall(null);
  };

  const endCall = () => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
      localStream.current = null;
    }

    if (localVideo.current) localVideo.current.srcObject = null;
    if (remoteVideo.current) remoteVideo.current.srcObject = null;

    setInCall(false);
    setIncomingCall(null);
  };

  return (
    <div>
      <IncomingCallModal
        isOpen={!!incomingCall}
        callerId={incomingCall?.from}
        onAccept={acceptCall}
        onReject={rejectCall}
      />

      {inCall && (
        <div className="call-screen">
          <video ref={localVideo} autoPlay muted style={{ width: 150 }} />
          <video ref={remoteVideo} autoPlay style={{ width: 300 }} />
          <button onClick={endCall}>Kết thúc cuộc gọi</button>
        </div>
      )}
    </div>
  );
}