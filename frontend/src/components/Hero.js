import React from 'react';
import { ArrowRight, Download } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { API, COLD_START_TIMEOUT } from '@/lib/api';

// Copie statique du CV servie par Vercel (frontend/public/), toujours disponible.
// Si elle est absente, on se rabat sur le CV stocké via l'admin (API Render).
const STATIC_CV_URL = '/CV_Mohamed_Balde.pdf';
const CV_FILENAME = 'CV_Mohamed_Balde.pdf';
const PHOTO_URL = "https://raw.githubusercontent.com/MohameBalde/Myportfolio/main/frontend/src/photo.jpeg";

export const Hero = () => {
  const scrollToProjects = () => {
    const element = document.getElementById('projects');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const fetchCV = async () => {
    try {
      const response = await axios.get(STATIC_CV_URL, { responseType: 'blob' });
      // Sans fichier statique, Vercel renvoie index.html au lieu d'un PDF.
      if (response.data.type === 'application/pdf') return response.data;
    } catch (error) {
      // Pas de copie statique : on tente l'API.
    }
    const response = await axios.get(`${API}/cv/download`, {
      responseType: 'blob',
      timeout: COLD_START_TIMEOUT
    });
    return response.data;
  };

  const handleDownloadCV = async () => {
    const toastId = toast.loading('Préparation du CV...');
    try {
      const blob = await fetchCV();
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', CV_FILENAME);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.dismiss(toastId);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('CV indisponible pour le moment. Demandez-le à balde8307@gmail.com', { id: toastId });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1775057154553-0f3e8902fea3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTZ8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGRhcmslMjBuZXR3b3JrJTIwdGVjaG5vbG9neXxlbnwwfHx8fDE3NzU2NjYwOTN8MA&ixlib=rb-4.1.0&q=85)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/80"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-32 text-center">

        {/* ✅ Photo de profil circulaire */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-[#0055FF] shadow-[0_0_25px_rgba(0,85,255,0.4)]">
              <img
                src={PHOTO_URL}
                alt="Mohamed Baldé"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Point vert "disponible" */}
            <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-400 rounded-full border-2 border-[#050505]"></div>
          </div>
        </div>

        <div className="mb-6">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#0055FF]" data-testid="hero-overline">
            Administrateur Réseaux & Systèmes
          </span>
        </div>

        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter leading-none text-white mb-6"
          data-testid="hero-title"
        >
          Mohamed Baldé
        </h1>

        <p
          className="text-base sm:text-lg text-[#A1A1AA] max-w-2xl mx-auto mb-4"
          data-testid="hero-subtitle"
        >
          CCNA | VoIP | Windows Server | WiFi Networks
        </p>

        <p className="text-base text-[#A1A1AA] max-w-2xl mx-auto mb-12">
          Étudiant passionné en réseaux et télécommunications, à la recherche d'un stage en administration réseaux et systèmes.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={scrollToProjects}
            className="bg-[#0055FF] text-white px-8 py-4 rounded-md hover:bg-[#3B82F6] hover:shadow-[0_0_15px_rgba(0,85,255,0.5)] transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2 font-medium"
            data-testid="hero-view-projects-btn"
          >
            Voir mes projets
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={handleDownloadCV}
            className="bg-transparent border border-white/20 text-white px-8 py-4 rounded-md hover:border-white/50 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2 font-medium"
            data-testid="hero-download-cv-btn"
          >
            <Download className="w-5 h-5" />
            Télécharger CV
          </button>
        </div>
      </div>
    </section>
  );
};
