import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // ✅ .jsx extension if renamed
import './index.css';
import { BrowserRouter } from 'react-router-dom'; // ✅ Import this

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* ✅ Wrap inside BrowserRouter */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
