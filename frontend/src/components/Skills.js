import React from 'react';
import { Network, Server, Phone, Code, Database, Activity } from 'lucide-react';

const skillsData = [
  {
    category: 'Réseaux',
    icon: Network,
    skills: ['CCNA 1 & 2 : routage et commutation', 'VLANs', 'DNS & DHCP', 'QoS', 'WiFi & portail captif']
  },
  {
    category: 'Supervision & Sécurité',
    icon: Activity,
    skills: ['Zabbix & SNMP', 'Tableaux de bord Grafana', 'Alertes par seuils', 'Pare-feu : UFW, firewalld', 'Cybersécurité (certificat Google en cours)']
  },
  {
    category: 'Systèmes & Virtualisation',
    icon: Server,
    skills: ['Windows Server : AD DS, GPO, DNS, DHCP', 'SharePoint & Exchange', 'VMware ESXi & vCenter', 'Veeam Backup & Replication, TrueNAS', 'Linux : Debian, CentOS, AlmaLinux']
  },
  {
    category: 'Télécommunications',
    icon: Phone,
    skills: ['VoIP : Issabel / Asterisk', 'SIP & plan de numérotation', "Serveur vocal, files d'attente, messagerie vocale", 'Softphones : Zoiper, MicroSIP']
  },
  {
    category: 'Développement',
    icon: Code,
    skills: ['Python / Flask', 'PHP / Laravel', 'Java / JEE', 'HTML, CSS, JavaScript']
  },
  {
    category: 'Données & Outils',
    icon: Database,
    skills: ['MySQL / MariaDB', 'Git & GitHub', 'Bash, SSH, cron', 'Déploiement sur Railway']
  }
];

export const Skills = () => {
  return (
    <section id="skills" className="py-24 md:py-32 bg-[#0F0F11]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <div className="mb-12">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#0055FF]">03. Compétences</span>
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
                className="bg-[#050505] p-8 border-r border-b border-white/10 hover:bg-[#1A1A1D] transition-colors group"
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
