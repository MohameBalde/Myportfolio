import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2, AlertTriangle } from 'lucide-react';
import { API, REQUEST_TIMEOUT } from '@/lib/api';

const SLOW_DELAY = 3000;

// Prévient l'admin quand l'API répond lentement ou pas du tout.
export const BackendStatusBanner = () => {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    let done = false;
    const slowTimer = setTimeout(() => !done && setStatus('slow'), SLOW_DELAY);

    axios
      .get(`${API}/projects`, { timeout: REQUEST_TIMEOUT })
      .then(() => setStatus('ok'))
      .catch(() => setStatus('down'))
      .finally(() => {
        done = true;
        clearTimeout(slowTimer);
      });

    return () => {
      done = true;
      clearTimeout(slowTimer);
    };
  }, []);

  if (status === 'slow') {
    return (
      <div
        className="flex items-center gap-3 bg-yellow-500/10 border-b border-yellow-500/30 text-yellow-200 text-sm px-8 py-3"
        data-testid="backend-status-slow"
      >
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        Le serveur met du temps à répondre. Les données vont s'afficher.
      </div>
    );
  }

  if (status === 'down') {
    return (
      <div
        className="flex items-center gap-3 bg-red-500/10 border-b border-red-500/30 text-red-200 text-sm px-8 py-3"
        data-testid="backend-status-down"
      >
        <AlertTriangle className="w-4 h-4 shrink-0" />
        Le serveur ne répond pas. Rechargez la page dans un instant ; si le problème persiste, vérifiez la base MongoDB Atlas.
      </div>
    );
  }

  return null;
};
