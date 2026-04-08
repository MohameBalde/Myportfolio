import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technologies: '',
    category: 'Network'
  });
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await axios.get(`${API}/projects`, { withCredentials: true });
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Erreur lors du chargement des projets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('technologies', formData.technologies);
      formDataToSend.append('category', formData.category);
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      if (editingProject) {
        await axios.put(
          `${API}/projects/${editingProject.id}?title=${encodeURIComponent(formData.title)}&description=${encodeURIComponent(formData.description)}&technologies=${encodeURIComponent(formData.technologies)}&category=${encodeURIComponent(formData.category)}`,
          imageFile ? formDataToSend : {},
          { 
            withCredentials: true,
            headers: imageFile ? { 'Content-Type': 'multipart/form-data' } : {}
          }
        );
        toast.success('Projet mis à jour avec succès');
      } else {
        await axios.post(
          `${API}/projects?title=${encodeURIComponent(formData.title)}&description=${encodeURIComponent(formData.description)}&technologies=${encodeURIComponent(formData.technologies)}&category=${encodeURIComponent(formData.category)}`,
          imageFile ? formDataToSend : {},
          { 
            withCredentials: true,
            headers: imageFile ? { 'Content-Type': 'multipart/form-data' } : {}
          }
        );
        toast.success('Projet créé avec succès');
      }

      fetchProjects();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error("Erreur lors de l'enregistrement du projet");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) return;

    try {
      await axios.delete(`${API}/projects/${projectId}`, { withCredentials: true });
      toast.success('Projet supprimé avec succès');
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Erreur lors de la suppression du projet');
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      technologies: project.technologies,
      category: project.category
    });
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProject(null);
    setFormData({ title: '', description: '', technologies: '', category: 'Network' });
    setImageFile(null);
  };

  if (loading) {
    return <div className="text-white">Chargement...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Gestion des Projets</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-[#0055FF] hover:bg-[#3B82F6]"
              data-testid="add-project-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Projet
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0F0F11] border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingProject ? 'Modifier le projet' : 'Nouveau projet'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Titre</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="bg-[#050505] border-white/10 text-white"
                  data-testid="project-title-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  className="bg-[#050505] border-white/10 text-white"
                  data-testid="project-description-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Technologies (séparées par des virgules)</label>
                <Input
                  value={formData.technologies}
                  onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                  required
                  placeholder="Ex: React, Node.js, MongoDB"
                  className="bg-[#050505] border-white/10 text-white"
                  data-testid="project-technologies-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Catégorie</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="bg-[#050505] border-white/10 text-white" data-testid="project-category-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F0F11] border-white/10">
                    <SelectItem value="Network">Network</SelectItem>
                    <SelectItem value="System">System</SelectItem>
                    <SelectItem value="Telecom">Telecom</SelectItem>
                    <SelectItem value="Web">Web</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Image</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="bg-[#050505] border-white/10 text-white"
                  data-testid="project-image-input"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#0055FF] hover:bg-[#3B82F6]"
                  data-testid="project-save-button"
                >
                  {submitting ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
                <Button
                  type="button"
                  onClick={handleCloseDialog}
                  className="bg-transparent border border-white/20 hover:bg-[#1A1A1D]"
                >
                  Annuler
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-[#0F0F11] border border-white/10 rounded-md overflow-hidden"
            data-testid={`project-card-${project.id}`}
          >
            {project.image_url && (
              <div className="aspect-video overflow-hidden bg-[#1A1A1D]">
                <img
                  src={`${process.env.REACT_APP_BACKEND_URL}${project.image_url}`}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#0055FF]/10 text-[#0055FF] border border-[#0055FF]/20">
                  {project.category}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(project)}
                    className="text-[#A1A1AA] hover:text-[#0055FF] transition-colors"
                    data-testid={`edit-project-${project.id}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="text-[#A1A1AA] hover:text-red-500 transition-colors"
                    data-testid={`delete-project-${project.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{project.title}</h3>
              <p className="text-[#A1A1AA] text-sm mb-4 line-clamp-3">{project.description}</p>
              <div className="flex flex-wrap gap-2">
                {project.technologies.split(',').map((tech, idx) => (
                  <span key={idx} className="px-2 py-1 bg-[#050505] text-[#71717A] text-xs rounded">
                    {tech.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12 text-[#A1A1AA]">
          Aucun projet pour le moment. Créez-en un !
        </div>
      )}
    </div>
  );
}
