require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');

const app = express();
const port = process.env.PORT || 5001;

app.use(helmet());

// Restrict CORS to known origins, with optional LAN support for dev testing.
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN,
  ...(process.env.FRONTEND_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'https://streamsphere-frontend.onrender.com'
];

const lanOriginRegex = /^https?:\/\/(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/;

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1 && !lanOriginRegex.test(origin)) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        console.error(msg, origin);
        return callback(new Error(msg), false);
      }

      return callback(null, true);
    }
  })
);

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
  console.log('Fetching songs for term:', term);
  const response = await axios.get('https://itunes.apple.com/search', {
    params: {
      term: term,
      entity: 'musicTrack',
      limit: SONGS_FETCH_LIMIT
    }
  });
  console.log('Received', response.data.resultCount, 'songs for term:', term);

  const songs = response.data.results;
  const recentSongs = songs
    .filter((song) => song.releaseDate && new Date(song.releaseDate) >= new Date(new Date().setFullYear(new Date().getFullYear() - 3)))
    .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));

  return recentSongs.length > 0 ? recentSongs : songs;
}

app.get('/api/music', async (req, res) => {
  let searchTerm = req.query.term;
  const pageParam = req.query.page;

  if (!searchTerm) {
    return res.status(400).json({ error: 'Search term is required' });
  }

  try {
    const now = Date.now();
    const cached = songCache[searchTerm];

    if (!cached || now - cached.timestamp > CACHE_DURATION_MS) {
      let singer = null;
      if (searchTerm.toLowerCase().startsWith('bollywood sad songs')) {
        singer = searchTerm.substring('bollywood sad songs'.length).trim();
      }

      let songs = await fetchSongs(searchTerm);

      if (singer) {
        const singerLower = singer.toLowerCase();
        songs = songs.filter((song) => song.artistName && song.artistName.toLowerCase().includes(singerLower));
      }

      songCache[searchTerm] = {
        songs,
        timestamp: now
      };
    }

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
    console.error('Error fetching music data:', error);
    res.status(500).json({ error: 'Error fetching music data' });
  }
});

app.post('/api/chatbot', express.json(), async (req, res) => {
  const { message } = req.body;
  const sessionId = uuid.v4();
  const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode: 'en'
      }
    }
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
