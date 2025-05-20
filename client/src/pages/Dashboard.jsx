import React from "react";
import { motion } from "framer-motion";
import { Smile, Music, User, Settings } from "lucide-react";
import { Link } from "react-router-dom";

const DashboardHome = () => {
  const features = [
    { icon: <Smile size={28} />, label: "Moodify", link: "/moodify" },
    { icon: <Music size={28} />, label: "Music", link: "/music-library" },
    { icon: <User size={28} />, label: "Profile", link: "/profile" },
    { icon: <Settings size={28} />, label: "Settings", link: "/settings" },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center text-white px-6 py-10">
      <motion.h1
        className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-4 text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Welcome to StreamSphere
      </motion.h1>

      <p className="text-gray-300 mb-10 text-center text-sm md:text-lg max-w-2xl">
        Your AI-powered music space — personalized playlists, visuals, and mood therapy.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl">
        {features.map((item, index) => (
          <motion.div
            key={index}
            className="bg-white/10 hover:bg-white/20 text-white p-6 rounded-xl backdrop-blur-md border border-white/10 flex flex-col items-center transition-all duration-300 shadow-lg"
            whileHover={{ scale: 1.08 }}
          >
            <Link to={item.link} className="flex flex-col items-center gap-2 text-white no-underline">
              {item.icon}
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DashboardHome;
