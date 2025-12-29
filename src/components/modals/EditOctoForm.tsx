import React, { useState } from 'react';
import { useFirebase } from '@/context';
import { useHive } from '@/context';
import { Save, X } from 'lucide-react';
import { Octo } from '@/types';

interface EditOctoFormProps {
  octo: Octo;
  onClose: () => void;
  onSave: () => void;
}

const EditOctoForm: React.FC<EditOctoFormProps> = ({ octo, onClose, onSave }) => {
  const { updateOcto } = useFirebase();
  const { refreshOctos } = useHive();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: octo.title,
    description: octo.description,
    tags: octo.tags.join(', '),
    link: octo.link,
    access: octo.access,
    format: octo.format
  });
  const [selectedFiles, setSelectedFiles] = useState<{
    name: string;
    url: string;
    type: string;
    file: File;
  }[]>(octo.files ? octo.files.map(f => ({ ...f, file: undefined as any })) : []);

  const acceptedExtensions = ['.md', '.webp', '.pdf', '.mp3', '.webm', '.json', '.csv', '.xml', '.glb', '.graphml', '.odhc'];

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files).map(file => ({
      name: file.name,
      url: URL.createObjectURL(file), // Pour preview locale
      type: file.name.split('.').pop()?.toLowerCase() || '',
      file
    }));
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (idx: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Title and description are required');
      return;
    }

    setIsSubmitting(true);

    try {
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      await updateOcto(octo.id, {
        ...formData,
        tags,
        files: selectedFiles.map(f => ({ name: f.name, url: f.url, type: f.type })),
        updatedAt: new Date().toISOString()
      });
      await refreshOctos();
      onSave();
    } catch (error) {
      console.error('Error updating octo:', error);
      alert('Error updating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-slate-900 disabled:text-slate-500"
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-slate-900 disabled:text-slate-500"
            rows={3}
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Tags (comma separated)</label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-slate-900 disabled:text-slate-500"
            placeholder="tag1, tag2, tag3"
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Link</label>
          <input
            type="url"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-slate-900 disabled:text-slate-500"
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Access Type</label>
            <select
              value={formData.access}
              onChange={(e) => setFormData({ ...formData, access: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-slate-900 disabled:text-slate-500"
              disabled={isSubmitting}
            >
              <option value="REST">REST</option>
              <option value="GraphQL">GraphQL</option>
              <option value="SPARQL">SPARQL</option>
              <option value="SOAP">SOAP</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Format</label>
            <select
              value={formData.format}
              onChange={(e) => setFormData({ ...formData, format: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-slate-900 disabled:text-slate-500"
              disabled={isSubmitting}
            >
              <option value="JSON">JSON</option>
              <option value="CSV">CSV</option>
              <option value="XML">XML</option>
              <option value="API">API</option>
            </select>
          </div>
        </div>

        {/* Upload de fichiers */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Associated Files</label>
          <input
            type="file"
            multiple
            accept={acceptedExtensions.join(',')}
            onChange={handleFilesChange}
            disabled={isSubmitting}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-800 file:text-cyan-400 hover:file:bg-slate-700 file:cursor-pointer cursor-pointer"
          />
          {/* Liste des fichiers sélectionnés */}
          {selectedFiles.length > 0 && (
            <ul className="mt-2 space-y-1">
              {selectedFiles.map((file, idx) => (
                <li key={idx} className="flex items-center justify-between bg-slate-800 rounded px-2 py-1 border border-slate-700">
                  <span className="truncate text-xs text-slate-300">{file.name} <span className="text-slate-500">({file.type})</span></span>
                  <button type="button" className="ml-2 text-red-400 hover:text-red-300 text-xs" onClick={() => handleRemoveFile(idx)} disabled={isSubmitting}>Remove</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-md hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <X className="w-4 h-4 mr-2 inline" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-md hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors shadow-lg shadow-cyan-900/20"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditOctoForm;