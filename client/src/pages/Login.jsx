import React, { useEffect, useState } from "react";
import "../styles/Login.css";
import { auth, provider } from "../firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const canvas = document.getElementById("soundwave-canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let wave = 0;

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      for (let i = 0; i < canvas.width; i++) {
        const y = canvas.height / 2 + Math.sin(i * 0.02 + wave) * 25;
        ctx.lineTo(i, y);
      }
      ctx.strokeStyle = "#00ffcc";
      ctx.lineWidth = 2;
      ctx.stroke();
      wave += 0.05;
      requestAnimationFrame(animate);
    }

    animate();
    return () => cancelAnimationFrame(animate);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate("/dashboard");
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
        <h1>🎧 Welcome Back to StreamSphere</h1>
        <p>Enter the vibe zone...</p>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Enter</button>
        </form>
        <button onClick={handleGoogle}>Continue with Google</button>
        <div style={{ marginTop: "10px" }}>
          <Link to="/signup">Sign up</Link> | <Link to="/forgot-password">Forgot Password?</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
