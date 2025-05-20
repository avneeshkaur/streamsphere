// src/components/AudioVisualizer.jsx
import React, { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";

const AudioVisualizer = ({ audioUrl }) => {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);

  useEffect(() => {
    if (!audioUrl || !waveformRef.current) return;

    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#3b82f6",
      progressColor: "#22c55e",
      height: 100,
      barWidth: 3,
      responsive: true,
    });

    wavesurfer.current.load(audioUrl);

    return () => {
      wavesurfer.current?.destroy();
    };
  }, [audioUrl]);

  return (
    <div className="my-2">
      <div ref={waveformRef} className="border border-blue-300 rounded" />
      <button
        className="mt-2 bg-blue-600 text-white px-4 py-1 rounded"
        onClick={() => wavesurfer.current.playPause()}
      >
        Play / Pause
      </button>
    </div>
  );
};

export default AudioVisualizer;
