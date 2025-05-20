import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
<div className="min-h-screen w-[230px] bg-white text-black p-6 flex flex-col gap-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">🎧 StreamSphere</h2>
      <nav className="flex flex-col gap-4 text-sm">
        <Link to="/dashboard" className="text-white no-underline hover:text-cyan-400 transition">🏠 Home</Link>
        <Link to="/music-library" className="text-white no-underline hover:text-cyan-400 transition">🎵 Music</Link>
        <Link to="/moodify" className="text-white no-underline hover:text-cyan-400 transition">😎 Moodify</Link>
        <Link to="/profile" className="text-white no-underline hover:text-cyan-400 transition">👤 Profile</Link>
        <Link to="/settings" className="text-white no-underline hover:text-cyan-400 transition">⚙️ Settings</Link>
      </nav>
    </div>
  );
};

export default Sidebar;
