import React, { useState } from 'react';
import { useFirebase } from '../../context/FirebaseContext';
import { useHive } from '../../context/HiveContext';
import { Save, X } from 'lucide-react';
import { Octo } from '../../types/octo';

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
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
            rows={3}
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
            placeholder="tag1, tag2, tag3"
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
          <input
            type="url"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Access Type</label>
            <select
              value={formData.access}
              onChange={(e) => setFormData({ ...formData, access: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
              disabled={isSubmitting}
            >
              <option value="REST">REST</option>
              <option value="GraphQL">GraphQL</option>
              <option value="SPARQL">SPARQL</option>
              <option value="SOAP">SOAP</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
            <select
              value={formData.format}
              onChange={(e) => setFormData({ ...formData, format: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
              disabled={isSubmitting}
            >
              <option value="JSON">JSON</option>
              <option value="CSV">CSV</option>
              <option value="XML">XML</option>
              <option value="API">API</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <X className="w-4 h-4 mr-2 inline" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
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