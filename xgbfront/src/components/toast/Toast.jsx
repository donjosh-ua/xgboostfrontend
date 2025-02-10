import React, { useEffect } from "react";
import "./ToastStyles.css";

function Toast({ message, onClose, duration = 15000 }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="toast">
      <span>{message}</span>
      <button type="button" onClick={onClose}>
        OK!
      </button>
    </div>
  );
}

export default Toast;
