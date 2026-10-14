import React from 'react';
import { Briefcase, ShieldCheck } from 'lucide-react';

const internship = {
  period: '3 — 30 sept. 2026',
  title: 'Stagiaire — Département Digital',
  org: 'Banque Nationale de Guinée (BNG)',
  place: 'Siège de Kaloum, Conakry',
  points: [
    'Stage d\'un mois au sein du Département Digital',
    'Rapport de stage rédigé (octobre 2026)',
  ],
};

const certification = {
  name: 'Google Cybersecurity Professional Certificate',
  issuer: 'Google — Coursera',
  done: 3,
  total: 9,
};

export const Experience = () => {
  const progress = (certification.done / certification.total) * 100;

  return (
    <section id="experience" className="py-24 md:py-32 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <div className="mb-12">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#0055FF]">02. Parcours</span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mt-4">
            Expérience & formation
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#0F0F11] border border-white/10 rounded-md p-8 hover:border-[#0055FF]/60 transition-colors" data-testid="experience-bng">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="bg-[#0055FF]/10 p-3 rounded-md">
                <Briefcase className="w-6 h-6 text-[#0055FF]" />
              </div>
              <span className="text-xs font-mono text-[#A1A1AA] bg-white/5 px-3 py-1 rounded-full whitespace-nowrap">
                {internship.period}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white">{internship.title}</h3>
            <p className="text-[#0055FF] text-sm font-medium mt-1">{internship.org}</p>
            <p className="text-[#71717A] text-sm mt-1">{internship.place}</p>
            <ul className="space-y-2 mt-5">
              {internship.points.map((point) => (
                <li key={point} className="text-[#A1A1AA] text-sm flex gap-2">
                  <span className="w-1.5 h-1.5 bg-[#0055FF] rounded-full mt-2 shrink-0"></span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#0F0F11] border border-white/10 rounded-md p-8 hover:border-[#0055FF]/60 transition-colors" data-testid="certification-google">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="bg-[#0055FF]/10 p-3 rounded-md">
                <ShieldCheck className="w-6 h-6 text-[#0055FF]" />
              </div>
              <span className="text-xs font-mono text-[#A1A1AA] bg-white/5 px-3 py-1 rounded-full whitespace-nowrap">
                En cours
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white">{certification.name}</h3>
            <p className="text-[#0055FF] text-sm font-medium mt-1">{certification.issuer}</p>
            <p className="text-[#71717A] text-sm mt-1">Certification en cybersécurité</p>
            <div className="mt-6">
              <div className="flex justify-between text-xs text-[#A1A1AA] mb-2">
                <span>Cours {certification.done} sur {certification.total}</span>
                <span>{Math.round(progress)} %</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#0055FF] rounded-full" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
