// StreamSphere\client\src\pages\Moodify.jsx

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../styles/Moodify.css";

const moodSearchTerms = {
  Happy: "Bollywood happy songs",
  Sad: "Bollywood sad songs ",
  Angry: "Bollywood rock songs",
  Calm: "Bollywood lofi calm songs",
  Romantic: "Bollywood romantic songs",
};

const moodImages = {
  Happy: "/assets/happy.jpg",
  Sad: "/assets/sad.jpg",
  Angry: "/assets/angry.jpg",
  Calm: "/assets/relaxed.jpg",
  Romantic: "/assets/romantic.jpg",
};

const API_BASE_URLS = [
  import.meta.env.VITE_BACKEND_URL,
  "https://streamsphere-backend.onrender.com",
  "http://localhost:5001",
].filter(Boolean);

const Moodify = () => {
  const [mood, setMood] = useState("");
  const [musicList, setMusicList] = useState([]);
  const [loadingMusic, setLoadingMusic] = useState(false);
  const [musicError, setMusicError] = useState("");
  const currentAudio = useRef(null);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    if (mood) {
      const searchTerm = moodSearchTerms[mood] || mood;
      setLoadingMusic(true);
      setMusicError("");
      (async () => {
        try {
          let data = null;
          const seen = new Set();
          for (const base of API_BASE_URLS) {
            if (seen.has(base)) continue;
            seen.add(base);
            try {
              const response = await axios.get(`${base}/api/music?term=${encodeURIComponent(searchTerm)}`, {
                timeout: 20000,
              });
              if (Array.isArray(response.data)) {
                data = response.data;
                break;
              }
            } catch {
              // Try next backend URL
            }
          }

          if (!data) throw new Error("Backend unreachable");
          setMusicList(data);
        } catch (error) {
          console.error("Error fetching music data:", error);
          setMusicList([]);
          setMusicError("Songs load nahi ho paaye. Backend wake-up ya network issue ho sakta hai.");
        } finally {
          setLoadingMusic(false);
        }
      })();
    }
  }, [mood]);

  const handlePlay = (audio) => {
    if (currentAudio.current && currentAudio.current !== audio) {
      currentAudio.current.pause();
    }
    currentAudio.current = audio;
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = { type: "user", text: message };
    setChat((prev) => [...prev, userMsg]);
    setMessage("");

    try {
      let data = null;
      const seen = new Set();
      for (const base of API_BASE_URLS) {
        if (seen.has(base)) continue;
        seen.add(base);
        try {
          const res = await fetch(`${base}/api/chatbot`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message }),
          });
          if (!res.ok) continue;
          data = await res.json();
          break;
        } catch {
          // Try next backend URL
        }
      }

      if (!data) {
        throw new Error("Chatbot backend unreachable");
      }
      const botMsg = { type: "bot", text: data.reply || "No response" };
      setChat((prev) => [...prev, botMsg]);
    } catch (err) {
      setChat((prev) => [...prev, { type: "bot", text: "Error talking to AI" }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`moodify-container ${mood.toLowerCase()}`}>
      <section className="moodify-left glass">
        <h1>Mood Music</h1>
        <p>Select your current mood</p>
        <div className="mood-buttons">
          {["Happy", "Sad", "Angry", "Calm", "Romantic"].map((m) => (
            <button key={m} onClick={() => setMood(m)}>
              {m}
            </button>
          ))}
        </div>

        {mood && (
          <div className="mood-image">
            <img src={moodImages[mood]} alt={mood} className="mood-preview-image" />
          </div>
        )}

        {loadingMusic && <p className="mood-status">Loading songs...</p>}
        {!loadingMusic && musicError && <p className="mood-status mood-error">{musicError}</p>}

        {mood && musicList.length > 0 && (
          <div className="music-list-container">
            <h3>Recommended for your mood</h3>
            <ul className="music-list">
              {musicList.map((track) => (
                <li key={track.trackId}>
                  <p>
                    {track.trackName} - {track.artistName}
                  </p>
                  <audio controls src={track.previewUrl} onPlay={(e) => handlePlay(e.target)}>
                    Your browser does not support the audio element.
                  </audio>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="moodify-right glass mood-chat-panel">
        <h2 className="mood-chat-title">MoodAI Chat</h2>
        <div className="mood-chat-history">
          {chat.map((msg, i) => (
            <div key={i} className={`mood-chat-row ${msg.type === "user" ? "user" : "bot"}`}>
              <span className={`mood-chat-bubble ${msg.type === "user" ? "user" : "bot"}`}>
                {msg.text}
              </span>
            </div>
          ))}
        </div>
        <div className="mood-chat-input-row">
          <textarea
            placeholder="Say something..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="mood-chat-input"
          />
          <button onClick={sendMessage} className="mood-chat-send">
            Send
          </button>
        </div>
      </section>
    </div>
  );
};

export default Moodify;
