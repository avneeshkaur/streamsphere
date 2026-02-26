// StreamSphere/client/src/components/MusicCard.jsx

import React from "react";
import MusicPlayer from "./MusicPlayer";

const MusicCard = ({ song }) => {
  return (
    <article className="music-card">
      <img src={song.album_image} alt={song.name} />
      <h4>{song.name}</h4>
      <p>{song.artist_name}</p>
      <MusicPlayer audio={song.audio} />
    </article>
  );
};

export default MusicCard;
