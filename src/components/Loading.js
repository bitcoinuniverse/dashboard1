import React from "react";

const Loading = () => (
  <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-50">
    <div className="w-48 h-1 bg-pink-700 rounded overflow-hidden">
      <div className="w-1/2 h-full bg-gradient-to-r from-pink-500 to-pink-300 animate-progress"></div>
    </div>
    <span className="mt-4 text-lg">Loading trader data...</span>
  </div>
);

export default Loading;
