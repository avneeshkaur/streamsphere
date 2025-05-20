// src/pages/ForgotPassword.js
import React, { useState } from "react";
import { auth } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { Link } from "react-router-dom";
import "../styles/Login.css"; // Reusing styles

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent.");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="soundwave-bg">
        <canvas id="soundwave-canvas"></canvas>
      </div>
      <div className="login-box">
        <h1>🔑 Reset Your Password</h1>
        <form onSubmit={handleReset}>
          <input
            type="email"
            placeholder="Enter your registered email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit">Send Reset Link</button>
        </form>
        <p>
          Remember your password? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
