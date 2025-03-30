import React from "react";

const Notification = ({ message, show }) => (
  <div
    className={`fixed bottom-16 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white p-3 rounded-lg border border-pink-500 shadow transition-opacity duration-500 ${
      show ? "opacity-100" : "opacity-0"
    } z-50`}
  >
    <i className="fas fa-info-circle text-pink-500 mr-2"></i> {message}
  </div>
);

export default Notification;
