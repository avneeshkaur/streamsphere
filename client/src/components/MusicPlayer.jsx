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
      waveColor: "#ddd",
      progressColor: "#4a90e2",
      cursorColor: "#4a90e2",
      barWidth: 2,
      barRadius: 3,
      responsive: true,
      height: 80,
      normalize: true,
      partialRender: true,
    });

    wavesurfer.current.load(audio);

    wavesurfer.current.on("ready", () => {
      setIsPlaying(false);
    });

    wavesurfer.current.on("play", () => {
      setIsPlaying(true);
    });

    wavesurfer.current.on("pause", () => {
      setIsPlaying(false);
    });

    wavesurfer.current.on("finish", () => {
      setIsPlaying(false);
    });

    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }
    };
  }, [audio]);

  const handlePlayPause = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
      // Removed immediate toggle of isPlaying here
    }
  };

  return (
    <div>
      <div ref={waveformRef} />
      <button onClick={handlePlayPause} style={{ marginTop: "10px" }}>
        {isPlaying ? "Pause" : "Play"}
      </button>
    </div>
  );
};

export default MusicPlayer;
