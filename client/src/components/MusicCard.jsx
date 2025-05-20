import React from "react";
import MusicPlayer from "./MusicPlayer";

const MusicCard = ({ song }) => {
  return (
    <div style={{
      border: "1px solid #ccc",
      borderRadius: "8px",
      padding: "10px",
      width: "200px",
      textAlign: "center",
      background: "#f9f9f9"
    }}>
      <img src={song.album_image} alt={song.name} style={{ width: "100%", borderRadius: "8px" }} />
      <h4>{song.name}</h4>
      <p>{song.artist_name}</p>
      <MusicPlayer audio={song.audio} />
    </div>
  );
};

export default MusicCard;
