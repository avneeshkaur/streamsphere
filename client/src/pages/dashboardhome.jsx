// src/pages/DashboardHome.js
import React, { useEffect, useState } from "react";
import "../styles/dashboardhome.css";
import { Smile, Music, User, Settings, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { motion } from "framer-motion";

const DashboardHome = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) setUser(user);
      else navigate("/");
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/");
  };

  const features = [
    { icon: <Smile size={28} />, label: "Moodify", link: "/moodify" },
    { icon: <Music size={28} />, label: "Music", link: "/music-library" },
    { icon: <User size={28} />, label: "VibeTube", link: "/vibeTube" },
    { icon: <Settings size={28} />, label: "Contact", link: "/contact" },
    { icon: <User size={28} />, label: "MoodAI", link: "/moodai" },
  ];

/* copyright@streamsphere */
  return (
    <div
      className="dashboard"
      style={{
        backgroundImage: `url("/assets/bgc.jpeg")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <header className="navbar">
        <motion.div className="logo" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          🎧 StreamSphere
        </motion.div>
        <ul className="nav-links">
          <li><Link to="/" aria-label="Home">Home</Link></li>
          <li><Link to="/music-library" aria-label="Music Library">Music</Link></li>
          <li><Link to="/moodify" aria-label="Moodify">Moodify</Link></li>
          <li><Link to="/moodai" aria-label="MoodAI">MoodAI</Link></li>
          <li><Link to="/vibeTube" aria-label="VibeTube">VibeTube</Link></li>
          <li><Link to="/contact" aria-label="Contact">Contact</Link></li>
          <li>
            <Link to="#" className="nav-link-logout" onClick={(e) => { e.preventDefault(); handleLogout(); }} aria-label="Logout">
              <LogOut size={20} /> Logout
            </Link>
          </li>
        </ul>
      </header>

      <main className="dashboard-container">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}>
          🎧 Welcome {user?.displayName || user?.email || "to"} <strong> StreamSphere</strong>
        </motion.h1>
        <p>Your AI-powered music space — personalized playlists, visuals, and mood therapy.</p>

        <div className="features">
          {features.map((item, index) => (
            <Link to={item.link} key={index} className="feature-card" aria-label={item.label} tabIndex="0">
              <span>{item.icon}</span>
              <h3>{item.label}</h3>
            </Link>
          ))}
        </div>
      </main>
      <footer className="footer">
        <p>© {new Date().getFullYear()} StreamSphere. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default DashboardHome;
