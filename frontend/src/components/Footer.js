import React from 'react';
import { Linkedin, Mail, Phone } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#0F0F11] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Mohamed Baldé</h3>
            <p className="text-[#A1A1AA] text-sm">
              Étudiant en Réseaux et Télécommunications<br />
              Administrateur Réseaux et Systèmes
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <div className="space-y-2">
              <a
                href="mailto:balde8307@gmail.com"
                className="flex items-center gap-2 text-[#A1A1AA] hover:text-[#0055FF] transition-colors text-sm"
                data-testid="footer-email"
              >
                <Mail className="w-4 h-4" />
                balde8307@gmail.com
              </a>
              <a
                href="tel:+224626158940"
                className="flex items-center gap-2 text-[#A1A1AA] hover:text-[#0055FF] transition-colors text-sm"
                data-testid="footer-phone"
              >
                <Phone className="w-4 h-4" />
                +224 626 15 89 40
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Réseaux Sociaux</h3>
            <a
              href="https://www.linkedin.com/in/mohamed-balde-959876394"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#A1A1AA] hover:text-[#0055FF] transition-colors text-sm"
              data-testid="footer-linkedin"
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </a>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/10 text-center text-[#71717A] text-sm">
          © {new Date().getFullYear()} Mohamed Baldé. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};
