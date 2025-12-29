import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, DollarSign, Calendar, Tag, Target } from 'lucide-react';
import { useFirebase } from '@/context';
import { useAuth } from '@/context';
import { DataRequest } from '@/types';

interface ProposeDataFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const ProposeDataForm: React.FC<ProposeDataFormProps> = ({ onClose, onSuccess }) => {
  const { addDataRequest } = useFirebase();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    objective: '',
    description: '',
    tags: '',
    desiredFormat: 'JSON',
    budget: '',
    deadline: '',
    domain: 'technology',
    contactEmail: '',
    isPublic: true,
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    requirements: ''
  });

  // Ajout pour la gestion du mode de data source
  const [dataSourceMode, setDataSourceMode] = useState<'file' | 'link'>('file');
  // Pour fichiers uploadés
  const [selectedFiles, setSelectedFiles] = useState<Array<{ name: string; type: string; file: File; url: string }>>([]);
  // Pour lien externe
  const [externalLink, setExternalLink] = useState('');
  const [externalType, setExternalType] = useState('');

  // Gestion du changement de fichiers
  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files).map(file => ({
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.name.split('.').pop()?.toLowerCase() || '',
      file
    }));
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  // Suppression d'un fichier sélectionné
  const handleRemoveFile = (idx: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== idx));
  };

  // Détection du type pour un lien externe
  const detectTypeFromUrl = (url: string) => {
    const ext = url.split('.').pop()?.toLowerCase().split('?')[0].split('#')[0];
    return ext || '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('You must be logged in to submit a data request');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      const requirements = formData.requirements.split('\n').map(req => req.trim()).filter(req => req);
      
      const dataRequest: Omit<DataRequest, 'id'> = {
        title: formData.title,
        objective: formData.objective,
        description: formData.description,
        tags,
        desiredFormat: formData.desiredFormat,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        deadline: formData.deadline || null,
        domain: formData.domain,
        contactEmail: formData.contactEmail || null,
        isPublic: formData.isPublic,
        priority: formData.priority,
        requirements,
        authorId: user.id,
        authorName: user.displayName,
        status: 'open',
        submissionsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addDataRequest(dataRequest);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting data request:', error);
      alert('Error submitting request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const domains = [
    'technology', 'healthcare', 'finance', 'education', 'environment',
    'transportation', 'government', 'research', 'entertainment', 'other'
  ];

  const formats = ['JSON', 'CSV', 'XML', 'API', 'Database', 'Other'];

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        background: 'radial-gradient(circle at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 100%)',
        backdropFilter: 'blur(8px)'
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[95vh] flex flex-col overflow-hidden"
        style={{
          boxShadow: '0 25px 50px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}
      >
        {/* Fixed Header */}
        <div className="relative bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white p-4 md:p-6 flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 md:top-4 md:right-4 p-2 rounded-full hover:bg-white/20 transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-3 pr-12">
            <div className="p-2 rounded-lg bg-white/20 flex-shrink-0">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl md:text-2xl">Propose Data Request</h2>
              <p className="text-amber-100 text-sm md:text-base">Submit a data bounty request for specific needs</p>
            </div>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title & Domain */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    placeholder="e.g., Climate Data for European Cities"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Domain
                  </label>
                  <select
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                  >
                    {domains.map(domain => (
                      <option key={domain} value={domain}>
                        {domain.charAt(0).toUpperCase() + domain.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Objective */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Objective *
                </label>
                <textarea
                  value={formData.objective}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors resize-none"
                  rows={3}
                  placeholder="Describe what you want to achieve with this data..."
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors resize-none"
                  rows={4}
                  placeholder="Provide more details about your data requirements..."
                />
              </div>

              {/* Tags & Format */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Tag className="inline h-4 w-4 mr-1" />
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    placeholder="climate, environment, europe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Desired Format
                  </label>
                  <select
                    value={formData.desiredFormat}
                    onChange={(e) => setFormData({ ...formData, desiredFormat: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                  >
                    {formats.map(format => (
                      <option key={format} value={format}>{format}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Budget & Deadline */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget/Bounty (€) - Optional
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                      placeholder="Optional - e.g., 1000"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Optional reward amount for completing this data request
                  </p>
                  <p className="text-xs text-amber-600 mt-1 font-medium">
                    💡 Tip: Adding a budget increases the chances of getting quality responses
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    If no deadline is set, the request will automatically expire after 100 days
                  </p>
                </div>
              </div>

              {/* Priority & Contact */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specific Requirements (one per line)
                </label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors resize-none"
                  rows={4}
                  placeholder="Data must be from 2020 onwards&#10;Include geographical coordinates&#10;Update frequency: monthly"
                />
              </div>

              {/* Data Source Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Source de données
                </label>
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="dataSourceMode"
                      value="file"
                      checked={dataSourceMode === 'file'}
                      onChange={() => setDataSourceMode('file')}
                      className="accent-amber-500"
                    />
                    <span>Fichier</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="dataSourceMode"
                      value="link"
                      checked={dataSourceMode === 'link'}
                      onChange={() => setDataSourceMode('link')}
                      className="accent-amber-500"
                    />
                    <span>Lien externe</span>
                  </label>
                </div>
                {/* Mode Fichier */}
                {dataSourceMode === 'file' && (
                  <div className="mb-4">
                    <input
                      type="file"
                      accept=".md,.webp,.pdf,.mp3,.webm,.json,.csv,.xml,.glb,.graphml,.odhc"
                      multiple
                      onChange={handleFilesChange}
                      className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                    />
                    {/* Liste des fichiers sélectionnés */}
                    {selectedFiles.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {selectedFiles.map((file, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <span className="font-medium">{file.name}</span>
                            <span className="text-gray-400">[{file.type}]</span>
                            <button type="button" onClick={() => handleRemoveFile(idx)} className="text-red-500 hover:text-red-700 ml-2">Supprimer</button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                {/* Mode Lien externe */}
                {dataSourceMode === 'link' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL de la source externe</label>
                    <input
                      type="text"
                      value={externalLink}
                      onChange={e => {
                        setExternalLink(e.target.value);
                        setExternalType(detectTypeFromUrl(e.target.value));
                      }}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    />
                    <label className="block text-xs text-gray-500 mt-1">Type détecté : <span className="font-semibold">{externalType || 'inconnu'}</span></label>
                  </div>
                )}
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Visibility
                </label>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      checked={formData.isPublic}
                      onChange={() => setFormData({ ...formData, isPublic: true })}
                      className="mt-0.5 accent-amber-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Public</div>
                      <div className="text-sm text-gray-600">Visible to all users on the bounty board</div>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      checked={!formData.isPublic}
                      onChange={() => setFormData({ ...formData, isPublic: false })}
                      className="mt-0.5 accent-amber-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Private</div>
                      <div className="text-sm text-gray-600">Only visible to OpenDataHive team for custom data sourcing</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Spacer for bottom padding */}
              <div className="h-4"></div>
            </form>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="border-t border-gray-200 p-4 md:p-6 bg-gray-50 flex-shrink-0">
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.title || !formData.objective}
              className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-lg flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Request
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProposeDataForm;