require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const path = require('path');

const app = express();
const port = process.env.PORT || 5001;

// Use helmet for security headers
app.use(helmet());

// Restrict CORS to frontend origin
const allowedOrigins = [process.env.FRONTEND_ORIGIN, 'http://localhost:5175', 'http://localhost:5174', 'http://localhost:5173', 'http://localhost:3000'];
app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      console.error(msg, origin);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

// Cache object to store songs and last fetch time per search term
const songCache = {};
const CACHE_DURATION_MS = 30 * 1000; // 30 seconds
const SONGS_PER_PAGE = 7;
const SONGS_FETCH_LIMIT = 200;

// Load the service account key from your JSON file
const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;


// Dialogflow configuration
const sessionClient = new dialogflow.SessionsClient({ keyFilename: keyPath });
const projectId = JSON.parse(require('fs').readFileSync(keyPath)).project_id;

// Helper function to fetch songs from iTunes API
async function fetchSongs(term) {
  console.log('Fetching songs for term:', term); // Debug log
  const response = await axios.get('https://itunes.apple.com/search', {
    params: {
      term: term,
      entity: 'musicTrack',
      limit: SONGS_FETCH_LIMIT,
    },
  });
  console.log('Received', response.data.resultCount, 'songs for term:', term); // Debug log
  // Filter and sort songs by releaseDate descending to prioritize newer songs
  const songs = response.data.results;
  const recentSongs = songs
    .filter(song => song.releaseDate && new Date(song.releaseDate) >= new Date(new Date().setFullYear(new Date().getFullYear() - 3)))
    .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
  return recentSongs.length > 0 ? recentSongs : songs; // fallback to all if no recent songs
}

// Helper function to get current slice of songs based on time
function getSongsSlice(songs) {
  if (!songs || songs.length === 0) return [];
  const now = new Date();
  const seconds = now.getSeconds();
  const totalSlices = Math.ceil(songs.length / SONGS_PER_PAGE);
  const sliceIndex = Math.floor(seconds / 30) % totalSlices;
  const start = sliceIndex * SONGS_PER_PAGE;
  return songs.slice(start, start + SONGS_PER_PAGE);
}

app.get('/api/music', async (req, res) => {
  let searchTerm = req.query.term; // Search query (e.g. "Bollywood happy songs")
  const pageParam = req.query.page;

  if (!searchTerm) {
    return res.status(400).json({ error: 'Search term is required' });
  }

  // Special case for Happy mood to include "buddhu sa mann h"
  // if (searchTerm.toLowerCase() === 'bollywood happy songs') {
  //   searchTerm = 'buddhu sa mann h bollywood happy songs';
  // }

  try {
    const now = Date.now();
    const cached = songCache[searchTerm];

    if (!cached || (now - cached.timestamp) > CACHE_DURATION_MS) {
      // Extract singer name from search term (assumed last word(s) after "Bollywood sad songs")
      let singer = null;
      if (searchTerm.toLowerCase().startsWith('bollywood sad songs')) {
        singer = searchTerm.substring('bollywood sad songs'.length).trim();
      }

      let songs = await fetchSongs(searchTerm);

      // If singer is specified, filter songs by artistName containing singer name (case-insensitive)
      if (singer) {
        const singerLower = singer.toLowerCase();
        songs = songs.filter(song => song.artistName && song.artistName.toLowerCase().includes(singerLower));
      }

      songCache[searchTerm] = {
        songs,
        timestamp: now,
      };
    }

    // Determine slice index from page param or fallback to time-based rotation
    let sliceIndex;
    if (pageParam !== undefined) {
      const pageNum = parseInt(pageParam, 10);
      sliceIndex = isNaN(pageNum) || pageNum < 0 ? 0 : pageNum;
    } else {
      const nowDate = new Date();
      const minute = nowDate.getMinutes();
      const totalSlices = Math.ceil(songCache[searchTerm].songs.length / SONGS_PER_PAGE);
      sliceIndex = minute % totalSlices;
    }

    const start = sliceIndex * SONGS_PER_PAGE;
    const currentSongs = songCache[searchTerm].songs.slice(start, start + SONGS_PER_PAGE);

    res.json(currentSongs);
  } catch (error) {
    console.error('Error fetching music data:', error); // Debug log
    res.status(500).json({ error: 'Error fetching music data' });
  }
});

// Route: /api/chatbot
app.post('/api/chatbot', express.json(), async (req, res) => {
  const { message } = req.body;
  const sessionId = uuid.v4();
  const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode: 'en',
      },
    },
  };

  try {
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;
    res.json({ reply: result.fulfillmentText });
  } catch (err) {
    console.error('Dialogflow Error:', err);
    res.status(500).json({ error: 'Dialogflow request failed' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
