import React, { useState, useEffect } from "react";
import MusicCard from "../components/MusicCard";

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

    const fetchMusic = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `http://localhost:5001/api/music?term=${encodeURIComponent(searchTerm)}`,
          { signal }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Unexpected API response structure");
        }
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
          // Fetch aborted, do nothing
          return;
        }
        setError(err.message);
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
    <div style={{ padding: "20px" }}>
      <h2>🎵 Music Library</h2>
      <input
        type="text"
        placeholder="Search songs..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          padding: "8px",
          width: "100%",
          maxWidth: "400px",
          marginBottom: "20px",
          fontSize: "16px",
        }}
      />
      {loading && <div>Loading music...</div>}
      {error && <div style={{ color: "red" }}>Error: {error}</div>}
      {!loading && !error && musicList.length === 0 && searchTerm && (
        <div>No songs found for "{searchTerm}".</div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {musicList.map((song) => (
          <MusicCard key={song.id} song={song} />
        ))}
      </div>
    </div>
  );
};

export default MusicLibrary;
