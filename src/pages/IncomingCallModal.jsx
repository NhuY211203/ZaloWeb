import React from "react";

export default function IncomingCallModal({ callerId, onAccept, onReject, isOpen }) {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>Cuộc gọi đến từ {callerId}</h3>
        <div>
          <button onClick={onAccept} style={styles.acceptButton}>Nhận</button>
          <button onClick={onReject} style={styles.rejectButton}>Từ chối</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center",
    zIndex: 9999,
  },
  modal: {
    backgroundColor: "#fff", padding: 20, borderRadius: 10, textAlign: "center",
    width: 300,
  },
  acceptButton: {
    marginRight: 10, padding: "8px 20px", backgroundColor: "green", color: "white", border: "none", borderRadius: 5,
    cursor: "pointer",
  },
  rejectButton: {
    padding: "8px 20px", backgroundColor: "red", color: "white", border: "none", borderRadius: 5,
    cursor: "pointer",
  },
};
