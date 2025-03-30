import React, { useState, useEffect } from "react";

const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-5 right-5 bg-pink-600 text-white p-2 rounded-full cursor-pointer transition-opacity ${
        visible ? "opacity-100" : "opacity-0"
      } hover:bg-pink-700`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <i className="fas fa-arrow-up"></i>
    </div>
  );
};

export default BackToTop;
