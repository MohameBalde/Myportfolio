export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Le backend Render (offre gratuite) s'endort après ~15 min et met jusqu'à ~60 s à se réveiller.
export const COLD_START_TIMEOUT = 60000;


// Les projets initiaux ont une URL d'image complète ; les images uploadées
// via l'admin sont servies par le backend (/api/files/...).
export const resolveImageUrl = (url) => (/^https?:\/\//.test(url) ? url : `${BACKEND_URL}${url}`);
