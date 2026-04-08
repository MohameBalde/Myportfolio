import React, { useState, useEffect } from 'react';
import { Network } from 'lucide-react';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'glass-effect' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Network className="w-6 h-6 text-[#0055FF]" />
            <span className="text-white font-bold text-xl font-['Outfit']">MB</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('about')}
              className="text-[#A1A1AA] hover:text-white transition-colors"
              data-testid="nav-about"
            >
              À propos
            </button>
            <button
              onClick={() => scrollToSection('skills')}
              className="text-[#A1A1AA] hover:text-white transition-colors"
              data-testid="nav-skills"
            >
              Compétences
            </button>
            <button
              onClick={() => scrollToSection('projects')}
              className="text-[#A1A1AA] hover:text-white transition-colors"
              data-testid="nav-projects"
            >
              Projets
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-[#A1A1AA] hover:text-white transition-colors"
              data-testid="nav-contact"
            >
              Contact
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
