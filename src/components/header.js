import React from "react";

const Header = ({ darkMode, setDarkMode }) => (
  <header className="sticky top-0 z-50 bg-gradient-to-r from-gray-900 to-gray-800 shadow-lg p-4 flex justify-between items-center">
    <div className="flex items-center space-x-2">
      <img
        src="https://bitcoinuniverse.io/static/media/logo.e12ac5ee857670720904.png"
        alt="Logo"
        className="h-10"
      />
      <span className="text-2xl font-bold text-pink-500">UNIVERSE</span>
    </div>
    <div className="text-lg font-semibold">Elite Traders Leaderboard</div>
    <div className="flex items-center space-x-4">
      <a
        href="https://t.me/dotswap_trade_bot"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg flex items-center"
      >
        <i className="fab fa-telegram-plane mr-2"></i> Trade Bot
      </a>
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg flex items-center"
      >
        <i className={`fas fa-${darkMode ? "sun" : "moon"} mr-2`}></i>
        {darkMode ? "Light" : "Dark"}
      </button>
    </div>
  </header>
);

export default Header;
