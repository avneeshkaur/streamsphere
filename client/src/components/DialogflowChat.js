// src/components/DialogflowChat.js
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";

const sessionId = uuidv4();

const DialogflowChat = () => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");

  const handleSend = async () => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chatbot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input, sessionId })
    });
    const data = await res.json();
    setResponse(data.reply);
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <textarea
        placeholder="Talk to your AI friend..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={3}
        style={{ width: "100%", padding: "10px", borderRadius: "10px" }}
      />
      <button onClick={handleSend} style={{ marginTop: "10px" }}>Send</button>
      <div style={{ marginTop: "15px", color: "#fff" }}>{response}</div>
    </div>
  );
};

export default DialogflowChat;
