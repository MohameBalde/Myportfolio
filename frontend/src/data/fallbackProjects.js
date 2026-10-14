// Projets affichés quand l'API ne répond pas à temps.
// Copie identique de INITIAL_PROJECTS dans api/index.py, dans l'ordre d'affichage.
export const fallbackProjects = [
  {
    id: "fallback-supervision-zabbix",
    title: "Supervision réseau centralisée & détection d'anomalies (PFE)",
    description: "Projet de fin d'études en binôme, en cours (soutenance en avril 2027). Plateforme de supervision basée sur Zabbix et SNMP avec auto-discovery, tableaux de bord Grafana (CPU, RAM, bande passante, disponibilité), détection d'anomalies par seuils et alertes email, puis portail Python/Flask et rapports PDF automatiques. Labo : VM Debian 13 (test et production) sous VMware Workstation, réseau NAT dédié.",
    technologies: "Zabbix, SNMP, Grafana, Python, Flask, Debian 13, VMware Workstation",
    category: "Network",
    image_url: "/projects/supervision-zabbix.webp"
  },
  {
    id: "fallback-windows-server-2025",
    title: "Infrastructure Windows Server 2025 — AD, iSCSI, SharePoint & Exchange",
    description: "Environnement d'entreprise complet sous Windows Server 2025 : contrôleur de domaine Active Directory, DNS, DHCP et GPO, stockage partagé iSCSI (cible/initiateur), SharePoint (sites collaboratifs, bibliothèques, permissions) et Exchange (boîtes aux lettres, flux de messagerie, intégration AD).",
    technologies: "Windows Server 2025, Active Directory, DNS, DHCP, GPO, iSCSI, SharePoint, Exchange",
    category: "System",
    image_url: "/projects/windows-server-2025.webp"
  },
  {
    id: "fallback-vmware-pra",
    title: "Plateforme de Sauvegarde & Cyber-résilience VMware",
    description: "Projet d'équipe (5 personnes) : infrastructure virtualisée avec plan de reprise après incident. Déploiement de VMware ESXi et vCenter, Active Directory et stockage TrueNAS (iSCSI/SMB), sauvegardes planifiées Veeam Backup & Replication avec alertes email, et simulation de PRA : restauration intégrale d'un serveur MariaDB sans perte de données.",
    technologies: "VMware ESXi, vCenter, Veeam Backup & Replication, TrueNAS, Active Directory",
    category: "System",
    image_url: "/projects/vmware-pra.webp"
  },
  {
    id: "fallback-makiti",
    title: "Makiti — Marketplace en ligne guinéenne",
    description: "Plateforme e-commerce multi-villes (Conakry, Kankan, Labé, Nzérékoré). Base de données MySQL, déploiement sur Railway et workflow Git avec pull requests. Logo SVG aux couleurs de la Guinée.",
    technologies: "MySQL, Railway, Git, GitHub, SVG",
    category: "Web",
    image_url: "/projects/makiti.webp"
  },
  {
    id: "fallback-zimbra-centos",
    title: "Serveur de Messagerie Zimbra sur CentOS",
    description: "Plateforme collaborative open-source, alternative à Exchange : installation de Zimbra Collaboration Suite sur CentOS, services SMTP, IMAP, POP3 et webmail, gestion des comptes, domaines, alias et quotas, configuration DNS (MX, A, SPF) et tests d'envoi/réception.",
    technologies: "Zimbra Collaboration Suite, CentOS, Postfix, SMTP, IMAP, POP3, DNS",
    category: "System",
    image_url: "/projects/zimbra-centos.webp"
  },
  {
    id: "fallback-lemp-lamp",
    title: "Serveurs Web LEMP & LAMP — Debian et AlmaLinux",
    description: "Stacks web complètes pour héberger des applications : LAMP (Apache, MySQL, PHP) sur Debian avec VirtualHosts et sécurisation, LEMP (Nginx, MariaDB, PHP-FPM) sur AlmaLinux avec reverse proxy, HTTPS via Let's Encrypt et pare-feu (UFW, firewalld).",
    technologies: "Debian, AlmaLinux, Apache, Nginx, MySQL, MariaDB, PHP-FPM, Let's Encrypt",
    category: "Web",
    image_url: "/projects/lemp-lamp.webp"
  },
  {
    id: "fallback-issabel-voip",
    title: "Téléphonie IP d'Entreprise — Issabel (Asterisk)",
    description: "PABX IP open-source pour la communication interne : installation du serveur Issabel, extensions SIP et plan de numérotation, serveur vocal interactif (IVR), files d'attente et messagerie vocale, tests avec softphones et contrôle de la qualité (QoS).",
    technologies: "Issabel, Asterisk, SIP, VoIP, Zoiper, MicroSIP",
    category: "Telecom",
    image_url: "/projects/issabel-voip.webp"
  }
];
