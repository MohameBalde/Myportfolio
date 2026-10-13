// Projets affichés quand l'API Render ne répond pas à temps (serveur endormi ou en panne).
// À garder synchronisé avec les projets saisis dans l'espace admin.
export const fallbackProjects = [
  {
    id: 'fallback-cisco',
    title: 'Infrastructure réseau multi-VLAN Cisco',
    description:
      "Conception et configuration d'un réseau d'entreprise segmenté en VLAN avec routage inter-VLAN, " +
      'routage dynamique OSPF, DHCP et listes de contrôle d\'accès, simulé sous Cisco Packet Tracer.',
    technologies: 'Cisco IOS, VLAN, OSPF, DHCP, ACL, Packet Tracer',
    category: 'Network',
    image_url: null
  },
  {
    id: 'fallback-voip',
    title: 'Téléphonie IP avec Asterisk',
    description:
      "Mise en place d'un serveur VoIP Asterisk : création des comptes SIP, plan de numérotation, " +
      'messagerie vocale et appels entre softphones sur le réseau local.',
    technologies: 'Asterisk, SIP, VoIP, Linux, Softphone',
    category: 'Telecom',
    image_url: null
  },
  {
    id: 'fallback-windows',
    title: 'Domaine Windows Server & Active Directory',
    description:
      "Déploiement d'un contrôleur de domaine Windows Server : Active Directory, DNS, DHCP, " +
      'gestion des utilisateurs et des groupes, et stratégies de groupe (GPO).',
    technologies: 'Windows Server, Active Directory, DNS, DHCP, GPO',
    category: 'System',
    image_url: null
  },
  {
    id: 'fallback-wifi',
    title: 'Réseau WiFi sécurisé',
    description:
      "Installation et sécurisation d'un réseau sans fil : plan d'adressage, SSID séparés pour les " +
      'invités et le personnel, chiffrement WPA2/WPA3 et contrôle de la couverture.',
    technologies: 'WiFi, WPA2/WPA3, Point d\'accès, VLAN',
    category: 'Network',
    image_url: null
  }
];
