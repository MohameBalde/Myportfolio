import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data } = await axios.get(`${API}/messages`, { withCredentials: true });
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (messageId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) return;

    try {
      await axios.delete(`${API}/messages/${messageId}`, { withCredentials: true });
      toast.success('Message supprimé avec succès');
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Erreur lors de la suppression du message');
    }
  };

  if (loading) {
    return <div className="text-white">Chargement...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-8">Messages reçus</h1>

      {messages.length === 0 ? (
        <div className="text-center py-12 text-[#A1A1AA]">
          Aucun message pour le moment.
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className="bg-[#0F0F11] border border-white/10 p-6 rounded-md"
              data-testid={`message-card-${message.id}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-white font-semibold">{message.name}</h3>
                    <a
                      href={`mailto:${message.email}`}
                      className="text-[#0055FF] hover:underline text-sm flex items-center gap-1"
                    >
                      <Mail className="w-4 h-4" />
                      {message.email}
                    </a>
                  </div>
                  <p className="text-[#71717A] text-xs">
                    {format(new Date(message.created_at), 'PPpp', { locale: fr })}
                  </p>
                </div>
                <Button
                  onClick={() => handleDelete(message.id)}
                  variant="ghost"
                  size="sm"
                  className="text-[#A1A1AA] hover:text-red-500"
                  data-testid={`delete-message-${message.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-[#A1A1AA] leading-relaxed">{message.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
