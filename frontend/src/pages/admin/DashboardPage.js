import React from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, MessageSquare, FileText, TrendingUp } from 'lucide-react';

const stats = [
  { icon: FolderKanban, label: 'Projets', value: '0', color: 'text-blue-400', link: '/admin/projects' },
  { icon: MessageSquare, label: 'Messages', value: '0', color: 'text-green-400', link: '/admin/messages' },
  { icon: FileText, label: 'CV', value: 'Non uploadé', color: 'text-purple-400', link: '/admin/cv' }
];

export default function DashboardPage() {
  const [data, setData] = React.useState({ projects: 0, messages: 0, hasCv: false });

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const [projectsRes, messagesRes, cvRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_BACKEND_URL}/api/projects`, { credentials: 'include' }),
          fetch(`${process.env.REACT_APP_BACKEND_URL}/api/messages`, { credentials: 'include' }),
          fetch(`${process.env.REACT_APP_BACKEND_URL}/api/cv/current`, { credentials: 'include' })
        ]);

        const projects = await projectsRes.json();
        const messages = await messagesRes.json();
        const cv = await cvRes.json();

        setData({
          projects: projects.length || 0,
          messages: messages.length || 0,
          hasCv: cv.has_cv || false
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-8">Tableau de bord</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/projects"
          className="bg-[#0F0F11] border border-white/10 p-6 rounded-md hover:border-[#0055FF] transition-all group"
          data-testid="dashboard-projects-card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-500/10 p-3 rounded-md group-hover:bg-blue-500/20 transition-colors">
              <FolderKanban className="w-6 h-6 text-blue-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-[#71717A]" />
          </div>
          <p className="text-[#A1A1AA] text-sm mb-1">Projets</p>
          <p className="text-white text-3xl font-bold">{data.projects}</p>
        </Link>

        <Link
          to="/admin/messages"
          className="bg-[#0F0F11] border border-white/10 p-6 rounded-md hover:border-[#0055FF] transition-all group"
          data-testid="dashboard-messages-card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-500/10 p-3 rounded-md group-hover:bg-green-500/20 transition-colors">
              <MessageSquare className="w-6 h-6 text-green-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-[#71717A]" />
          </div>
          <p className="text-[#A1A1AA] text-sm mb-1">Messages</p>
          <p className="text-white text-3xl font-bold">{data.messages}</p>
        </Link>

        <Link
          to="/admin/cv"
          className="bg-[#0F0F11] border border-white/10 p-6 rounded-md hover:border-[#0055FF] transition-all group"
          data-testid="dashboard-cv-card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-500/10 p-3 rounded-md group-hover:bg-purple-500/20 transition-colors">
              <FileText className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <p className="text-[#A1A1AA] text-sm mb-1">CV</p>
          <p className="text-white text-xl font-semibold">{data.hasCv ? 'Uploadé' : 'Non uploadé'}</p>
        </Link>
      </div>
    </div>
  );
}
