// AUTO-DETECT BACKEND BASE URL
let HOST = window.location.hostname;

// If running on localhost (Vite dev mode)
if (HOST === "localhost" || HOST === "127.0.0.1") {
  HOST = "10.155.237.59"; // fallback to your laptop IP
}

export const API_BASE = `http://${HOST}:5000`;
