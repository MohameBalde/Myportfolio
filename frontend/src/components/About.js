import React from 'react';
import { GraduationCap, Target } from 'lucide-react';

const PHOTO_URL = "https://raw.githubusercontent.com/MohameBalde/Myportfolio/main/frontend/src/photo.jpeg";

export const About = () => {
  return (
    <section id="about" className="py-24 md:py-32 bg-[#0F0F11]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <div className="mb-12">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#0055FF]">01. À propos</span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mt-4">
            Qui suis-je ?
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* ✅ Photo de profil */}
          <div className="flex justify-center lg:justify-start">
            <div className="relative">
              <div className="w-56 h-56 lg:w-64 lg:h-64 rounded-2xl overflow-hidden border-2 border-[#0055FF]/30 shadow-[0_0_30px_rgba(0,85,255,0.15)]">
                <img
                  src={PHOTO_URL}
                  alt="Mohamed Baldé"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Badge décoratif */}
              <div className="absolute -bottom-3 -right-3 bg-[#0055FF] text-white text-xs font-mono px-3 py-1 rounded-md">
                Réseau & Télécom
              </div>
            </div>
          </div>

          {/* Texte */}
          <div className="space-y-6">
            <p className="text-base text-[#A1A1AA] leading-relaxed">
              Je suis Mohamed Baldé, étudiant passionné en <span className="text-white font-medium">Réseaux Informatiques et Télécommunications</span>.
              Mon parcours académique et mes projets pratiques m'ont permis de développer une expertise solide en administration
              de réseaux et de systèmes.
            </p>
            <p className="text-base text-[#A1A1AA] leading-relaxed">
              Je maîtrise les technologies de routage et de commutation, l'administration Windows Server,
              ainsi que les systèmes de téléphonie VoIP. Mon objectif est de mettre ces compétences au service
              d'entreprises innovantes dans le cadre d'un stage enrichissant.
            </p>
          </div>

          {/* Cards */}
          <div className="space-y-6">
            <div className="bg-[#050505] border border-white/10 p-6 rounded-md">
              <div className="flex items-start gap-4">
                <div className="bg-[#0055FF]/10 p-3 rounded-md">
                  <GraduationCap className="w-6 h-6 text-[#0055FF]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Formation</h3>
                  <p className="text-[#A1A1AA] text-sm">
                    Étudiant en Réseaux Informatiques et Télécommunications
                  </p>
                  <p className="text-[#71717A] text-sm mt-1">
                    Spécialisation : Administration Réseaux et Systèmes
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-[#050505] border border-white/10 p-6 rounded-md">
              <div className="flex items-start gap-4">
                <div className="bg-[#0055FF]/10 p-3 rounded-md">
                  <Target className="w-6 h-6 text-[#0055FF]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Objectif Professionnel</h3>
                  <p className="text-[#A1A1AA] text-sm">
                    Recherche active d'un stage en administration réseaux et systèmes pour approfondir mes
                    compétences techniques et contribuer à des projets concrets.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
