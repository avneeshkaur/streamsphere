// src/components/DialogflowChat.js
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";

const projectId = "lyrical-bus-458006"; // 🔁 Use your own Project ID
const sessionId = uuidv4();

const DialogflowChat = () => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");

  const handleSend = async () => {
    const res = await fetch("http://localhost:5002/api/dialogflow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input, sessionId }),
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
