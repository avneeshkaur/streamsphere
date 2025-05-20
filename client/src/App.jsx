import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardHome from "./pages/dashboardhome";
import MusicLibrary from "./pages/MusicLibrary";
import Moodify from "./pages/Moodify";
import Login from "./pages/Login";
import VibeTube from "./pages/vibeTube";
import Contact from "./pages/contact";
import MoodAI from "./pages/MoodAI";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/music-library" element={<MusicLibrary />} />
        <Route path="/moodify" element={<Moodify />} />
        <Route path="/moodai" element={<MoodAI />} />
        <Route path="/profile" element={<VibeTube />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/vibetube" element={<VibeTube />} />
      </Routes>
    </>
  );
}

export default App;
