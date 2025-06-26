import React, { useState } from 'react';
import { useFirebase } from '../../context/FirebaseContext';
import { useHive } from '../../context/HiveContext';
import { useAuth } from '../../context/AuthContext';
import { Plus } from 'lucide-react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('You must be logged in to add an octo');
      return;
    }
    
    try {
      const tags = formData.tags.split(',').map(tag => tag.trim());
      await addOcto({
        ...formData,
        tags,
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
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Link</label>
          <input
            type="url"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Access Type</label>
            <select
              value={formData.access}
              onChange={(e) => setFormData({ ...formData, access: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="REST">REST</option>
              <option value="GraphQL">GraphQL</option>
              <option value="SPARQL">SPARQL</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Format</label>
            <select
              value={formData.format}
              onChange={(e) => setFormData({ ...formData, format: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="JSON">JSON</option>
              <option value="CSV">CSV</option>
              <option value="XML">XML</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Visibility</label>
          <div className="mt-2 flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="visibility"
                checked={formData.isPublic}
                onChange={() => setFormData({ ...formData, isPublic: true })}
                className="mr-2 accent-primary-500"
              />
              <span className="text-sm text-gray-700">Public</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="visibility"
                checked={!formData.isPublic}
                onChange={() => setFormData({ ...formData, isPublic: false })}
                className="mr-2 accent-primary-500"
              />
              <span className="text-sm text-gray-700">Private</span>
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {formData.isPublic 
              ? "Visible to all users" 
              : "Visible only to you"
            }
          </p>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-lg flex items-center transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddOctoForm; 