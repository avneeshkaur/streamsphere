// StreamSphere/client/src/pages/MusicLibrary.jsx

import React, { useState, useEffect } from "react";
import MusicCard from "../components/MusicCard";
import "../styles/musiclibrary.css";

const API_BASE_URLS = [
  import.meta.env.VITE_BACKEND_URL,
  "https://streamsphere-backend.onrender.com",
  "http://localhost:5001",
].filter(Boolean);

const MusicLibrary = () => {
  const [musicList, setMusicList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!searchTerm) {
      setMusicList([]);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchMusicFromBackend = async (term, currentSignal) => {
      const seen = new Set();
      for (const base of API_BASE_URLS) {
        if (seen.has(base)) continue;
        seen.add(base);
        try {
          const response = await fetch(`${base}/api/music?term=${encodeURIComponent(term)}`, {
            signal: currentSignal,
          });
          if (!response.ok) continue;
          const data = await response.json();
          if (Array.isArray(data)) return data;
        } catch (err) {
          if (err.name === "AbortError") throw err;
        }
      }
      throw new Error("Backend unreachable");
    };

    const fetchMusic = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMusicFromBackend(searchTerm, signal);
        const songs = data.map((track) => ({
          id: track.trackId,
          name: track.trackName,
          artist_name: track.artistName,
          album_image: track.artworkUrl100,
          audio: track.previewUrl,
        }));
        setMusicList(songs);
      } catch (err) {
        if (err.name === "AbortError") {
          return;
        }
        setError("API connect nahi ho raha. Backend deploy/cold-start check karo.");
      } finally {
        setLoading(false);
      }
    };

    const debounceFetch = setTimeout(fetchMusic, 800);

    return () => {
      clearTimeout(debounceFetch);
      controller.abort();
    };
  }, [searchTerm]);

  return (
    <div className="music-library-page">
      <h2 className="music-library-title">Music Library</h2>
      <input
        type="text"
        placeholder="Search songs..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="music-library-search"
      />
      {loading && <div className="music-library-status">Loading music...</div>}
      {error && <div className="music-library-status error">Error: {error}</div>}
      {!loading && !error && musicList.length === 0 && searchTerm && (
        <div className="music-library-status">No songs found for "{searchTerm}".</div>
      )}
      <div className="music-library-grid">
        {musicList.map((song) => (
          <MusicCard key={song.id} song={song} />
        ))}
      </div>
    </div>
  );
};

export default MusicLibrary;
