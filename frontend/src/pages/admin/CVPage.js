import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Download, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CVPage() {
  const [cvInfo, setCvInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchCVInfo();
  }, []);

  const fetchCVInfo = async () => {
    try {
      const { data } = await axios.get(`${API}/cv/current`, { withCredentials: true });
      setCvInfo(data);
    } catch (error) {
      console.error('Error fetching CV info:', error);
      setCvInfo({ has_cv: false });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Seuls les fichiers PDF sont acceptés');
      e.target.value = '';
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await axios.post(`${API}/cv/upload`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('CV uploadé avec succès');
      
      // Reset file input
      setSelectedFile(null);
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      
      // Refetch CV info
      await fetchCVInfo();
    } catch (error) {
      console.error('Error uploading CV:', error);
      const errorMsg = error.response?.data?.detail || "Erreur lors de l'upload du CV";
      toast.error(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await axios.get(`${API}/cv/download`, {
        withCredentials: true,
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', cvInfo?.filename || 'CV_Mohamed_Balde.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('CV téléchargé');
    } catch (error) {
      console.error('Error downloading CV:', error);
      toast.error('Erreur lors du téléchargement');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-8">Gestion du CV</h1>

      <div className="max-w-2xl space-y-6">
        {cvInfo?.has_cv && (
          <div className="bg-[#0F0F11] border border-white/10 p-6 rounded-md">
            <div className="flex items-start gap-4">
              <div className="bg-green-500/10 p-3 rounded-md">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">CV actuel</h3>
                <p className="text-[#A1A1AA] text-sm mb-2">{cvInfo.filename}</p>
                {cvInfo.uploaded_at && (
                  <p className="text-[#71717A] text-xs mb-4">
                    Uploadé le {format(new Date(cvInfo.uploaded_at), 'PPpp', { locale: fr })}
                  </p>
                )}
                <Button
                  onClick={handleDownload}
                  className="bg-[#0055FF] hover:bg-[#3B82F6]"
                  data-testid="download-cv-button"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-[#0F0F11] border border-white/10 p-6 rounded-md">
          <h3 className="text-white font-semibold mb-4">
            {cvInfo?.has_cv ? 'Remplacer le CV' : 'Uploader un CV'}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Sélectionner un fichier PDF
              </label>
              <Input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                disabled={uploading}
                className="bg-[#050505] border-white/10 text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#0055FF] file:text-white hover:file:bg-[#3B82F6] file:cursor-pointer"
                data-testid="cv-file-input"
              />
              <p className="text-[#71717A] text-xs mt-2">
                Formats acceptés : PDF uniquement (max 10MB)
              </p>
            </div>

            {selectedFile && (
              <div className="flex items-center gap-2 p-3 bg-[#1A1A1D] rounded-md border border-white/10">
                <FileText className="w-4 h-4 text-[#0055FF]" />
                <span className="text-[#A1A1AA] text-sm flex-1">{selectedFile.name}</span>
                <span className="text-[#71717A] text-xs">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="bg-[#0055FF] hover:bg-[#3B82F6] disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="upload-cv-button"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Upload en cours...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Uploader le CV
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
