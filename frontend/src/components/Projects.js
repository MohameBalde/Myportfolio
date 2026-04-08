import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ExternalLink } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const categoryColors = {
  Network: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  System: 'bg-green-500/10 text-green-400 border-green-500/20',
  Telecom: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Web: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
};

export const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await axios.get(`${API}/projects`);
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(projects.map(p => p.category))];
  const filteredProjects = selectedCategory === 'All'
    ? projects
    : projects.filter(p => p.category === selectedCategory);

  if (loading) {
    return (
      <section id="projects" className="py-24 md:py-32 bg-[#0F0F11]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 text-center">
          <p className="text-[#A1A1AA]">Chargement des projets...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="py-24 md:py-32 bg-[#0F0F11]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <div className="mb-12">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#0055FF]">03. Réalisations</span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mt-4">
            Mes Projets
          </h2>
        </div>

        <div className="flex flex-wrap gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-[#0055FF] text-white'
                  : 'bg-transparent border border-white/20 text-[#A1A1AA] hover:border-white/50'
              }`}
              data-testid={`filter-${cat}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, idx) => (
            <div
              key={project.id}
              className="bg-[#050505] border border-white/10 rounded-md overflow-hidden hover:border-[#0055FF] transition-all duration-300 hover:shadow-lg group"
              data-testid={`project-card-${idx}`}
            >
              {project.image_url && (
                <div className="aspect-video overflow-hidden bg-[#1A1A1D]">
                  <img
                    src={`${process.env.REACT_APP_BACKEND_URL}${project.image_url}`}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      categoryColors[project.category] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                    }`}
                  >
                    {project.category}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{project.title}</h3>
                <p className="text-[#A1A1AA] text-sm mb-4 line-clamp-3">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.split(',').map((tech, techIdx) => (
                    <span
                      key={techIdx}
                      className="px-2 py-1 bg-[#1A1A1D] text-[#71717A] text-xs rounded"
                    >
                      {tech.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#A1A1AA]">Aucun projet dans cette catégorie.</p>
          </div>
        )}
      </div>
    </section>
  );
};
