// \StreamSphere\client\src\App.jsx

import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

const DashboardHome = lazy(() => import("./pages/dashboardhome"));
const MusicLibrary = lazy(() => import("./pages/MusicLibrary"));
const Moodify = lazy(() => import("./pages/Moodify"));
const Login = lazy(() => import("./pages/Login"));
const VibeTube = lazy(() => import("./pages/vibeTube"));
const Contact = lazy(() => import("./pages/contact"));
const MoodAI = lazy(() => import("./pages/MoodAI"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));

function App() {
  return (
    <Suspense fallback={<div style={{ padding: "20px", color: "#fff" }}>Loading...</div>}>
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
    </Suspense>
  );
}

export default App;
