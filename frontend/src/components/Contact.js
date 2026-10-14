import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Phone, Send, Linkedin, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

import { API, REQUEST_TIMEOUT } from '@/lib/api';

const CONTACT_EMAIL = 'balde8307@gmail.com';

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    website: '' // champ piège anti-robots, invisible pour les visiteurs
  });
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFailed(false);
    const slowTimer = setTimeout(() => setSlow(true), 5000);

    try {
      await axios.post(`${API}/messages`, formData, { timeout: REQUEST_TIMEOUT });
      toast.success('Message envoyé avec succès !');
      setFormData({ name: '', email: '', message: '', website: '' });
    } catch (error) {
      setFailed(true);
      toast.error(
        error.response?.status === 429
          ? 'Trop de messages envoyés. Réessayez plus tard ou écrivez-moi directement par email.'
          : "Le message n'a pas pu être envoyé. Écrivez-moi directement par email."
      );
      console.error('Contact error:', error);
    } finally {
      clearTimeout(slowTimer);
      setSlow(false);
      setLoading(false);
    }
  };

  const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    `Contact portfolio - ${formData.name}`
  )}&body=${encodeURIComponent(`${formData.message}\n\n${formData.name}\n${formData.email}`)}`;

  return (
    <section id="contact" className="py-24 md:py-32 bg-[#0F0F11]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <div className="mb-12">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#0055FF]">05. Contact</span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mt-4">
            Discutons de votre projet
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <p className="text-base text-[#A1A1AA] leading-relaxed mb-8">
              Je suis actuellement à la recherche d'opportunités de stage en administration réseaux et systèmes.
              N'hésitez pas à me contacter pour discuter de vos besoins ou de toute collaboration potentielle.
            </p>

            <div className="space-y-4">
              <a
                href="mailto:balde8307@gmail.com"
                className="flex items-center gap-3 text-[#A1A1AA] hover:text-[#0055FF] transition-colors group"
                data-testid="contact-email-link"
              >
                <div className="bg-[#050505] p-3 rounded-md group-hover:bg-[#0055FF]/10 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <span>balde8307@gmail.com</span>
              </a>

              <a
                href="tel:+224626158940"
                className="flex items-center gap-3 text-[#A1A1AA] hover:text-[#0055FF] transition-colors group"
                data-testid="contact-phone-link"
              >
                <div className="bg-[#050505] p-3 rounded-md group-hover:bg-[#0055FF]/10 transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <span>+224 626 15 89 40</span>
              </a>

              <a
                href="https://www.linkedin.com/in/mohamed-balde-959876394"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-[#A1A1AA] hover:text-[#0055FF] transition-colors group"
                data-testid="contact-linkedin-link"
              >
                <div className="bg-[#050505] p-3 rounded-md group-hover:bg-[#0055FF]/10 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </div>
                <span>LinkedIn</span>
              </a>
            </div>
          </div>

          <div className="bg-[#050505] border border-white/10 p-8 rounded-md">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
                <label htmlFor="website">Ne pas remplir ce champ</label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                  Nom complet
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  className="bg-[#0F0F11] border-white/10 text-white"
                  data-testid="contact-name-input"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-[#0F0F11] border-white/10 text-white"
                  data-testid="contact-email-input"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  maxLength={5000}
                  rows={5}
                  className="bg-[#0F0F11] border-white/10 text-white"
                  data-testid="contact-message-input"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0055FF] hover:bg-[#3B82F6] hover:shadow-[0_0_15px_rgba(0,85,255,0.5)] transition-all"
                data-testid="contact-submit-button"
              >
                {loading ? (slow ? 'Envoi en cours, patientez...' : 'Envoi...') : 'Envoyer le message'}
                <Send className="w-4 h-4 ml-2" />
              </Button>

              {failed && (
                <div
                  className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-sm text-[#A1A1AA] p-4 rounded-md"
                  role="alert"
                  data-testid="contact-error"
                >
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                  <p>
                    L'envoi a échoué. Vous pouvez m'écrire directement à{' '}
                    <a href={mailtoHref} className="text-white underline hover:text-[#0055FF]">
                      {CONTACT_EMAIL}
                    </a>{' '}
                    (votre message sera pré-rempli).
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
