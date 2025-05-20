/* copyright@streamsphere */
import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import birdImage from '../assets/bird.png';
const punchbag = "/assets/punchbag.png";
const punchSound = "/assets/punch.mp3";
import '../styles/moodai.css';

const MoodAI = () => {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const punchRef = useRef(null);
  const intervalIdRef = useRef(null);
  const streamRef = useRef(null);

  const [mood, setMood] = useState('neutral');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [audioSrc, setAudioSrc] = useState('');
  const [quoteStory, setQuoteStory] = useState('');
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [isBroken, setIsBroken] = useState(false);
  const [punches, setPunches] = useState(0);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models/tiny_face_detector_model');
        await faceapi.nets.faceExpressionNet.loadFromUri('/models/face_expression');
        setLoading(false);
      } catch (err) {
        setError('Failed to load face-api models');
        setLoading(false);
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (loading || error) return;
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setError('Cannot access webcam'));

    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
      clearInterval(intervalIdRef.current);
    };
  }, [loading, error]);

  const handleVideoPlay = () => {
    clearInterval(intervalIdRef.current);
    intervalIdRef.current = setInterval(async () => {
      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detections?.expressions) {
        const topMood = Object.entries(detections.expressions)
          .reduce((max, curr) => (curr[1] > max[1] ? curr : max), ['', 0])[0];
        setMood(topMood);
        setIsFaceDetected(true);
        setIsBroken(false);
        setPunches(0);

        switch (topMood) {
          case 'happy':
            setAudioSrc('/assets/happy.mp3');
            setQuoteStory('Today is a beautiful day to smile 😊');
            break;
          case 'sad':
            setAudioSrc('/assets/comedy.mp4');
            setQuoteStory('Why don’t scientists trust atoms? Because they make up everything! 😂');
            break;
          case 'angry':
            setAudioSrc('');
            setQuoteStory('Punch to release your anger! 💥');
            setTimeout(() => {
              punchRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
            break;
          default:
            setAudioSrc('/assets/relax.mp3');
            setQuoteStory('Relax and enjoy the calmness 🌿');
        }
      } else {
        setMood('neutral');
        setIsFaceDetected(false);
      }
    }, 2000);
  };

  const handlePunch = () => {
    const newPunches = punches + 1;
    setPunches(newPunches);
    const sound = new Audio(punchSound);
    sound.play();
    punchRef.current.classList.add('shake');
    setTimeout(() => punchRef.current.classList.remove('shake'), 400);

    if (newPunches >= 5) {
      setIsBroken(true);
      setQuoteStory('Punch absorbed. You feel lighter now. 🧘‍♀️');
    }
  };

  useEffect(() => {
    if (mood !== 'happy' && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [mood]);

  return (
    <div className={`moodai-container ${mood === 'happy' ? '' : mood + '-bg'}`}>
      <h1>Mood AI Detection</h1>
      {error && <p className="error">{error}</p>}
      <video
        ref={videoRef}
        autoPlay
        muted
        onLoadedMetadata={handleVideoPlay}
        className="mood-video"
        width="480"
        height="360"
      />
      <p className="detected">
        Detected Mood: <strong>{mood === 'neutral' ? 'relaxed' : mood}</strong>
      </p>

      {audioSrc && <audio ref={audioRef} controls autoPlay src={audioSrc} />}
      {quoteStory && <p className="quote">{quoteStory}</p>}

      {mood === 'angry' && !isBroken && (
        <div className="punch-zone">
          <img
            ref={punchRef}
            src={punchbag}
            alt="Punch Bag"
            onClick={handlePunch}
            className="punchbag big"
          />
          <p>Punches: {punches} / 5</p>
        </div>
      )}

      {mood === 'angry' && isBroken && (
        <p className="quote">😌 You calmed down!</p>
      )}

      {(mood === 'relaxed' || mood === 'neutral' || mood === 'calm') && isFaceDetected && (
        <div className="bird-container">
          <div className="bird" style={{ backgroundImage: `url(${birdImage})` }}></div>
          <div className="bird bird2" style={{ backgroundImage: `url(${birdImage})` }}></div>
          <div className="bird bird3" style={{ backgroundImage: `url(${birdImage})` }}></div>
        </div>
      )}

      {(mood === 'neutral' || mood === 'calm' || mood === 'relaxed') && (
        <video className="bg-video" loop muted>
          <source src="/assets/nature.mp4" type="video/mp4" />
        </video>
      )}

      {mood === 'happy' && (
        <div className="happy-wallpaper"></div>
      )}
    </div>
  );
};

export default MoodAI;
