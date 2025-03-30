import React from "react";

const Footer = () => (
  <footer className="bg-gray-800 p-4 text-center mt-8 border-t border-pink-500">
    <p>© 2025 BitcoinUniverse.io. All rights reserved.</p>
    <div className="flex justify-center space-x-4 mt-2">
      <a
        href="https://x.com/bitcoinunified"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-pink-500"
      >
        <i className="fab fa-twitter"></i>
      </a>
      <a
        href="https://t.co/kO4JjSAesO"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-pink-500"
      >
        <i className="fab fa-discord"></i>
      </a>
      <a
        href="mailto:support@bitcoinuniverse.io"
        className="hover:text-pink-500"
      >
        <i className="fas fa-envelope"></i>
      </a>
    </div>
  </footer>
);

export default Footer;
