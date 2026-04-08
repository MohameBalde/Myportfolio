import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, FolderKanban, MessageSquare, FileText, LogOut, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { path: '/admin/projects', icon: FolderKanban, label: 'Projets' },
  { path: '/admin/messages', icon: MessageSquare, label: 'Messages' },
  { path: '/admin/cv', icon: FileText, label: 'CV' }
];

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#050505] flex">
      <aside className="w-64 bg-[#0F0F11] border-r border-white/10 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Network className="w-6 h-6 text-[#0055FF]" />
            <span className="text-white font-bold text-xl font-['Outfit']">Admin Panel</span>
          </div>
          <p className="text-[#71717A] text-sm">{user?.email}</p>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                      isActive
                        ? 'bg-[#0055FF] text-white'
                        : 'text-[#A1A1AA] hover:bg-[#1A1A1D] hover:text-white'
                    }`
                  }
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-white/10">
          <Button
            onClick={handleLogout}
            className="w-full bg-transparent border border-white/20 text-white hover:bg-[#1A1A1D] hover:border-white/50"
            data-testid="logout-button"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
