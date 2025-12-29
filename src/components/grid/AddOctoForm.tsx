import React, { useState } from 'react';
import { useFirebase } from '@/context';
import { useHive } from '@/context';
import { useAuth } from '@/context';
import { Plus, X } from 'lucide-react';

interface AddOctoFormProps {
  onClose: () => void;
}

const AddOctoForm: React.FC<AddOctoFormProps> = ({ onClose }) => {
  const { addOcto } = useFirebase();
  const { refreshOctos } = useHive();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    link: '',
    access: 'REST',
    format: 'JSON',
    isPublic: true
  });

  const [selectedFiles, setSelectedFiles] = useState<{
    name: string;
    url: string;
    type: string;
    file: File;
  }[]>([]);

  const acceptedExtensions = ['.md', '.webp', '.pdf', '.mp3', '.webm', '.json', '.csv', '.xml', '.glb', '.graphml', '.odhc'];

  const [dataSourceMode, setDataSourceMode] = useState<'file' | 'link'>('file');
  const [externalLink, setExternalLink] = useState('');
  const [externalType, setExternalType] = useState('');
  const [externalName, setExternalName] = useState('');

  const detectTypeFromUrl = (url: string) => {
    const ext = url.split('.').pop()?.toLowerCase().split('?')[0].split('#')[0];
    return ext || '';
  };

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
    if (!user) {
      alert('You must be logged in to add an octo');
      return;
    }

    try {
      const tags = formData.tags.split(',').map(tag => tag.trim());
      let files = [];
      if (dataSourceMode === 'file') {
        if (selectedFiles.length === 0) {
          alert('Please select at least one file.');
          return;
        }
        files = selectedFiles.map(f => ({ name: f.name, type: f.type, file: f.file, sourceType: 'storage' }));
      } else if (dataSourceMode === 'link') {
        if (!externalLink || !externalName) {
          alert('Please provide both the link and the source name.');
          return;
        }
        files = [{ name: externalName, url: externalLink, type: externalType, sourceType: 'external' }];
      }
      // On retire le champ link du formData
      const { link, ...restFormData } = formData;
      await addOcto({
        ...restFormData,
        tags,
        files,
        addedAt: new Date().toISOString(),
        authorId: user.id,
        authorName: user.displayName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      await refreshOctos();
      onClose();
    } catch (error) {
      console.error('Error adding octo:', error);
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
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Description (optional)</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            rows={3}
            placeholder="Enter a short description (optional)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Tags (comma separated, optional)</label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            placeholder="e.g. weather, open data, Paris"
          />
        </div>

        {/* Champs Link, Access Type, Format : visibles seulement en mode 'lien' */}
        {dataSourceMode === 'link' && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Link</label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                required={dataSourceMode === 'link'}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Access Type</label>
                <select
                  value={formData.access}
                  onChange={(e) => setFormData({ ...formData, access: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                >
                  <option value="REST">REST</option>
                  <option value="GraphQL">GraphQL</option>
                  <option value="SPARQL">SPARQL</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Format</label>
                <select
                  value={formData.format}
                  onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                >
                  <option value="JSON">JSON</option>
                  <option value="CSV">CSV</option>
                  <option value="XML">XML</option>
                </select>
              </div>
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Visibility</label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="visibility"
                checked={formData.isPublic}
                onChange={() => setFormData({ ...formData, isPublic: true })}
                className="mr-2 accent-cyan-500 bg-slate-800 border-slate-700"
              />
              <span className="text-sm text-slate-300">Public</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="visibility"
                checked={!formData.isPublic}
                onChange={() => setFormData({ ...formData, isPublic: false })}
                className="mr-2 accent-cyan-500 bg-slate-800 border-slate-700"
              />
              <span className="text-sm text-slate-300">Private</span>
            </label>
          </div>
        </div>

        {/* Data Source Mode */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Source Type</label>
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="dataSourceMode"
                value="file"
                checked={dataSourceMode === 'file'}
                onChange={() => setDataSourceMode('file')}
                className="accent-cyan-500 bg-slate-800 border-slate-700"
              />
              <span className="text-slate-300 text-sm">File Upload</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="dataSourceMode"
                value="link"
                checked={dataSourceMode === 'link'}
                onChange={() => setDataSourceMode('link')}
                className="accent-cyan-500 bg-slate-800 border-slate-700"
              />
              <span className="text-slate-300 text-sm">External Link</span>
            </label>
          </div>

          {/* Mode Fichier */}
          {dataSourceMode === 'file' && (
            <div className="mb-4">
              <input
                type="file"
                multiple
                accept={acceptedExtensions.join(',')}
                onChange={handleFilesChange}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-800 file:text-cyan-400 hover:file:bg-slate-700 file:cursor-pointer cursor-pointer"
              />
              {/* Liste des fichiers sélectionnés */}
              {selectedFiles.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {selectedFiles.map((file, idx) => (
                    <li key={idx} className="flex items-center justify-between bg-slate-800 rounded px-2 py-1 border border-slate-700">
                      <span className="truncate text-xs text-slate-300">{file.name} <span className="text-slate-500">({file.type})</span></span>
                      <button type="button" className="ml-2 text-red-400 hover:text-red-300 text-xs" onClick={() => handleRemoveFile(idx)}>Remove</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {/* Mode Lien externe */}
          {dataSourceMode === 'link' && (
            <div className="mb-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">External Source URL</label>
                <input
                  type="url"
                  value={externalLink}
                  onChange={e => {
                    setExternalLink(e.target.value);
                    setExternalType(detectTypeFromUrl(e.target.value));
                  }}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
                <span className="block text-xs text-slate-500 mt-1">Detected type: <span className="font-semibold text-cyan-400">{externalType || 'unknown'}</span></span>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Source Name</label>
                <input
                  type="text"
                  value={externalName}
                  onChange={e => setExternalName(e.target.value)}
                  placeholder="Name of the source"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-md hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4 mr-2 inline" />
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-md flex items-center transition-colors shadow-lg shadow-cyan-900/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Data Source
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddOctoForm;