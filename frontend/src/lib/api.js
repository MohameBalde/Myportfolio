// L'API tourne sur le même site (fonction Vercel, /api/*). REACT_APP_API_URL sert
// uniquement en développement local pour pointer vers une autre adresse.
export const BACKEND_URL = process.env.REACT_APP_API_URL || '';
export const API = `${BACKEND_URL}/api`;

// Délai max d'une requête avant d'abandonner (base injoignable, réseau lent).
export const REQUEST_TIMEOUT = 20000;

// Les images uploadées via l'admin sont servies par l'API (/api/files/...) ;
// certaines anciennes images sont des URL complètes.
export const resolveImageUrl = (url) => (/^https?:\/\//.test(url) ? url : `${BACKEND_URL}${url}`);
