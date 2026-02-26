// StreamSphere/client/src/components/MusicPlayer.jsx

import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

const MusicPlayer = ({ audio }) => {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (wavesurfer.current) {
      wavesurfer.current.destroy();
    }

    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#334155",
      progressColor: "#22d3ee",
      cursorColor: "#2dd4bf",
      barWidth: 2,
      barRadius: 3,
      responsive: true,
      height: 56,
      normalize: true,
      partialRender: true,
    });

    wavesurfer.current.load(audio);

    wavesurfer.current.on("ready", () => setIsPlaying(false));
    wavesurfer.current.on("play", () => setIsPlaying(true));
    wavesurfer.current.on("pause", () => setIsPlaying(false));
    wavesurfer.current.on("finish", () => setIsPlaying(false));

    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }
    };
  }, [audio]);

  const handlePlayPause = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
    }
  };

  return (
    <div className="music-player">
      <div ref={waveformRef} />
      <button onClick={handlePlayPause} className="music-player-btn">
        {isPlaying ? "Pause" : "Play"}
      </button>
    </div>
  );
};

export default MusicPlayer;
