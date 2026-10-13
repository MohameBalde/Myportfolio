export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Le backend Render (offre gratuite) s'endort après ~15 min et met jusqu'à ~60 s à se réveiller.
export const COLD_START_TIMEOUT = 60000;

