// Projets affichés quand l'API Render ne répond pas à temps (serveur endormi ou en panne).
// Copie des projets enregistrés dans la base (backend/server.py, seed_initial_projects) :
// à garder synchronisé avec les projets saisis dans l'espace admin.
export const fallbackProjects = [
  {
    id: 'fallback-vlan',
    title: 'Configuration Réseau VLAN',
    description:
      "Mise en place d'une architecture réseau segmentée avec VLANs pour optimiser la sécurité et les performances.",
    technologies: 'Cisco Packet Tracer, VLAN, Routing',
    category: 'Network',
    image_url:
      'https://images.pexels.com/photos/5480781/pexels-photo-5480781.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'
  },
  {
    id: 'fallback-windows-server',
    title: 'Déploiement Windows Server',
    description:
      'Installation et configuration de Windows Server 2019 avec Active Directory, DNS et DHCP.',
    technologies: 'Windows Server, Active Directory, GPO',
    category: 'System',
    image_url:
      'https://images.unsplash.com/photo-1762163516269-3c143e04175c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHwxfHxzZXJ2ZXIlMjByYWNrJTIwZGFya3xlbnwwfHx8fDE3NzU2NjYwODl8MA&ixlib=rb-4.1.0&q=85'
  },
  {
    id: 'fallback-voip',
    title: 'Serveur VoIP Issabel',
    description:
      "Configuration d'un serveur de téléphonie IP avec Issabel pour gérer les appels internes.",
    technologies: 'Issabel, Asterisk, VoIP, SIP',
    category: 'Telecom',
    image_url:
      'https://images.unsplash.com/photo-1604869515882-4d10fa4b0492?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTV8MHwxfHNlYXJjaHwxfHxmaWJlciUyMG9wdGljJTIwY2FibGVzfGVufDB8fHx8MTc3NTY2NjA4OXww&ixlib=rb-4.1.0&q=85'
  }
];
