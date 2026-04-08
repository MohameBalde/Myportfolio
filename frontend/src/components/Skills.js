import React from 'react';
import { Network, Server, Phone, Code, Database } from 'lucide-react';

const skillsData = [
  {
    category: 'Réseaux',
    icon: Network,
    skills: ['CCNA', 'Routing & Switching', 'VLANs', 'WiFi Networks', 'Network Security']
  },
  {
    category: 'Systèmes',
    icon: Server,
    skills: ['Windows Server', 'Active Directory', 'GPO', 'Hyper-V', 'DNS & DHCP']
  },
  {
    category: 'Télécommunications',
    icon: Phone,
    skills: ['VoIP', 'Issabel', 'Asterisk', 'SIP Protocol', 'Telephony Systems']
  },
  {
    category: 'Développement',
    icon: Code,
    skills: ['HTML', 'CSS', 'JavaScript', 'PHP', 'Laravel']
  },
  {
    category: 'Base de données',
    icon: Database,
    skills: ['MySQL', 'SQL Queries', 'Database Design', 'PhpMyAdmin']
  }
];

export const Skills = () => {
  return (
    <section id="skills" className="py-24 md:py-32 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <div className="mb-12">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#0055FF]">02. Compétences</span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mt-4">
            Expertise Technique
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10">
          {skillsData.map((category, idx) => {
            const Icon = category.icon;
            return (
              <div
                key={idx}
                className="bg-[#0F0F11] p-8 border-r border-b border-white/10 hover:bg-[#1A1A1D] transition-colors group"
                data-testid={`skill-category-${idx}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-[#0055FF]/10 p-3 rounded-md group-hover:bg-[#0055FF]/20 transition-colors">
                    <Icon className="w-6 h-6 text-[#0055FF]" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{category.category}</h3>
                </div>
                <ul className="space-y-2">
                  {category.skills.map((skill, skillIdx) => (
                    <li key={skillIdx} className="text-[#A1A1AA] text-sm flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#0055FF] rounded-full"></span>
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
