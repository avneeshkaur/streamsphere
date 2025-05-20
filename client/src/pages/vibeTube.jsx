import React, { useEffect, useRef, useState } from 'react';
import '../styles/vibeTube.css';

const VibeTube = () => {
  const videoRef = useRef(null);
  const iframeRef = useRef(null);
  const canvasRef = useRef(null);
  const [videoSrc, setVideoSrc] = useState('');
  const [isIframe, setIsIframe] = useState(false);
  const [volume, setVolume] = useState(1.0); // Default to 100%
  const [filterEnabled, setFilterEnabled] = useState(true);

  const audioCtxRef = useRef(null);
  const gainRef = useRef(null);
  const analyserRef = useRef(null);
  const drawCleanupRef = useRef(null);

  useEffect(() => {
    adjustBrightnessByTimeAndScreen();
  }, [filterEnabled]);

  const setupAudio = () => {
    if (isIframe || audioCtxRef.current || !videoRef.current) return;

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaElementSource(videoRef.current);
    const gainNode = audioCtx.createGain();
    const analyser = audioCtx.createAnalyser();

    // Set normalized video volume
    videoRef.current.volume = 1.0;

    // Set boosted gain
    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);

    source.connect(analyser);
    analyser.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    audioCtxRef.current = audioCtx;
    gainRef.current = gainNode;
    analyserRef.current = analyser;

    drawCleanupRef.current = drawVisualizer(analyser);
  };

  const drawVisualizer = (analyser) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    let isCancelled = false;

    const draw = () => {
      if (isCancelled) return;
      requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      let x = 0;
      const barWidth = (WIDTH / bufferLength) * 2.5;
      let total = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i];
        total += barHeight;
        ctx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
        ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }

      const avg = total / bufferLength;
      video.style.boxShadow = `0 0 ${avg}px ${avg / 12}px rgba(255, 0, 100, 0.6)`;
      document.body.style.background = `radial-gradient(circle, rgba(${avg},0,50,0.15), black)`;
    };

    draw();

    return () => {
      isCancelled = true;
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      document.body.style.background = '';
    };
  };

  const adjustBrightnessByTimeAndScreen = () => {
    if (!filterEnabled) {
      document.body.style.filter = '';
      return;
    }
    const hour = new Date().getHours();
    const width = window.screen.availWidth;
    const isNight = hour >= 20 || hour <= 6;
    const brightness = isNight ? 0.95 : 1.05;
    const contrast = width > 1080 ? 1.15 : 1.05;
    document.body.style.filter = `brightness(${brightness}) contrast(${contrast})`;
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setIsIframe(false);
    }
  };

  const handlePasteLink = () => {
    const url = prompt('Paste video link (YouTube, Dailymotion, or direct .mp4):');
    if (!url) return;

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const id = url.includes('v=') ? new URL(url).searchParams.get('v') : url.split('/').pop();
      setVideoSrc(`https://www.youtube.com/embed/${id}?autoplay=1`);
      setIsIframe(true);
    } else if (url.includes('dailymotion.com')) {
      const id = url.split('/video/')[1]?.split('_')[0];
      setVideoSrc(`https://www.dailymotion.com/embed/video/${id}?autoplay=1`);
      setIsIframe(true);
    } else if (url.endsWith('.mp4') || url.endsWith('.webm')) {
      setVideoSrc(url);
      setIsIframe(false);
    } else {
      alert('❌ Invalid link! Paste YouTube, Dailymotion, or direct video URL.');
    }
  };

  useEffect(() => {
    if (!isIframe && videoRef.current) {
      const video = videoRef.current;
      video.play().catch(() => {});
      const cleanup = setupAudio();
      return () => {
        if (drawCleanupRef.current) drawCleanupRef.current();
      };
    }
  }, [videoSrc, isIframe, volume]);

  return (
    <div className="vibetube-container">
      <div className="video-controls">
        <input type="file" accept="video/*" onChange={handleUpload} />
        <button onClick={handlePasteLink}>Paste Video Link</button>
        <label>Volume: {Math.round(volume * 100)}%</label>
        <input
          type="range"
          min="0"
          max="6"
          step="0.1"
          value={volume}
          onChange={(e) => {
            const vol = Math.min(parseFloat(e.target.value), 6);
            setVolume(vol);
            if (gainRef.current) {
              gainRef.current.gain.setValueAtTime(vol, audioCtxRef.current.currentTime);
              console.log('Volume set to:', vol);
            }
          }}
        />
        <button
          className="filter-toggle-btn"
          onClick={() => setFilterEnabled(!filterEnabled)}
          aria-pressed={filterEnabled}
        >
          {filterEnabled ? 'Disable Filter' : 'Enable Filter'}
        </button>
      </div>

      {isIframe ? (
        videoSrc && (
          <iframe
            ref={iframeRef}
            className="cinema-video"
            src={videoSrc}
            frameBorder="0"
            allow="autoplay; fullscreen"
            allowFullScreen
          ></iframe>
        )
      ) : (
        videoSrc && (
          <video
            ref={videoRef}
            className="cinema-video"
            src={videoSrc}
            controls
            autoPlay
            muted={false}
          />
        )
      )}

      {!isIframe && videoSrc && (
        <canvas ref={canvasRef} className="audio-visualizer" width="800" height="100" />
      )}
    </div>
  );
};

export default VibeTube;
