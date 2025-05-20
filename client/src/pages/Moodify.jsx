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

const Moodify = () => {
  const [mood, setMood] = useState("");
  const [musicList, setMusicList] = useState([]);
  const currentAudio = useRef(null);

  // Chatbot state
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    if (mood) {
      const searchTerm = moodSearchTerms[mood] || mood;
      axios
        .get(`http://localhost:5001/api/music?term=${encodeURIComponent(searchTerm)}`)
        .then((response) => {
          setMusicList(response.data);
        })
        .catch((error) => {
          console.error("Error fetching music data:", error);
          setMusicList([]);
        });
    }
  }, [mood]);

  const handlePlay = (audio) => {
    if (currentAudio.current && currentAudio.current !== audio) {
      currentAudio.current.pause();
    }
    currentAudio.current = audio;
  };

  // Chatbot function
  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = { type: "user", text: message };
    setChat((prev) => [...prev, userMsg]);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5001/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      const botMsg = { type: "bot", text: data.reply || "No response" };
      setChat((prev) => [...prev, botMsg]);
    } catch (err) {
      setChat((prev) => [...prev, { type: "bot", text: "⚠️ Error talking to AI" }]);
    }
  };

  // Added keyboard event handler for Enter key to send message
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`moodify-container ${mood.toLowerCase()}`}>
      {/* Left Section */}
      <section className="moodify-left glass">
        <h1>Mood Music 🎵</h1>
        <p>Select your current mood</p>
        <div className="mood-buttons">
          {["Happy", "Sad", "Angry", "Calm", "Romantic"].map((m) => (
            <button key={m} onClick={() => setMood(m)}>
              {m === "Happy" && "😊 "}
              {m === "Sad" && "😢 "}
              {m === "Angry" && "😠 "}
              {m === "Calm" && "😌 "}
              {m === "Romantic" && "💖 "}
              {m}
            </button>
          ))}
        </div>

        {mood && (
          <div className="mood-image">
            <img src={moodImages[mood]} alt={mood} style={{ maxWidth: "200px", borderRadius: "15px" }} />
          </div>
        )}

        {mood && musicList.length > 0 && (
          <div className="music-list-container">
            <h3>Recommended for your mood 🎧</h3>
            <ul className="music-list">
              {musicList.map((track) => (
                <li key={track.trackId}>
                  <p>{track.trackName} - {track.artistName}</p>
                  <audio
                    controls
                    src={track.previewUrl}
                    onPlay={(e) => handlePlay(e.target)}
                  >
                    Your browser does not support the audio element.
                  </audio>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Right Section - AI Chatbot */}
      <section className="moodify-right glass" style={{ flexBasis: "25%", padding: "15px" }}>
        <h2 style={{ fontSize: "1.2rem" }}>🧠 MoodAI Chat</h2>
        <div style={{
          height: "300px",
          overflowY: "auto",
          background: "#111",
          padding: "10px",
          borderRadius: "10px",
          marginBottom: "10px",
          color: "#fff"
        }}>
          {chat.map((msg, i) => (
            <div key={i} style={{ textAlign: msg.type === "user" ? "right" : "left", margin: "5px 0" }}>
              <span style={{
                background: msg.type === "user" ? "#0051ff" : "#00ffcc",
                padding: "8px 12px",
                borderRadius: "10px",
                display: "inline-block"
              }}>
                {msg.text}
              </span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <textarea
            placeholder="Say something..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "5px",
              border: "none",
              fontSize: "1rem",
              resize: "none",
              height: "40px"
            }}
          />
          <button
            onClick={sendMessage}
            style={{
              padding: "10px 15px",
              background: "#00ffcc",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Send
          </button>
        </div>
      </section>
    </div>
  );
};

export default Moodify;
