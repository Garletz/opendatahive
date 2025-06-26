import React, { useState } from 'react';
import { useFirebase } from '../../context/FirebaseContext';
import { useHive } from '../../context/HiveContext';
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface NestedOctoFormProps {
  onClose: () => void;
}

interface OctoFormData {
  title: string;
  description: string;
  tags: string;
  link: string;
  access: string;
  format: string;
}

const OctoFormFields: React.FC<{
  data: OctoFormData;
  onChange: (data: OctoFormData) => void;
  isCompact?: boolean;
}> = ({ data, onChange, isCompact = false }) => {
  return (
    <div className={`space-y-${isCompact ? '3' : '4'}`}>
      <div>
        <label className={`block text-${isCompact ? 'xs' : 'sm'} font-medium text-gray-700`}>Title</label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${isCompact ? 'text-sm py-1.5' : ''}`}
          required
        />
      </div>

      <div>
        <label className={`block text-${isCompact ? 'xs' : 'sm'} font-medium text-gray-700`}>Description</label>
        <textarea
          value={data.description}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${isCompact ? 'text-sm' : ''}`}
          rows={isCompact ? 2 : 3}
          required
        />
      </div>

      <div>
        <label className={`block text-${isCompact ? 'xs' : 'sm'} font-medium text-gray-700`}>Tags (comma separated)</label>
        <input
          type="text"
          value={data.tags}
          onChange={(e) => onChange({ ...data, tags: e.target.value })}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${isCompact ? 'text-sm py-1.5' : ''}`}
          required
        />
      </div>

      <div>
        <label className={`block text-${isCompact ? 'xs' : 'sm'} font-medium text-gray-700`}>Link</label>
        <input
          type="url"
          value={data.link}
          onChange={(e) => onChange({ ...data, link: e.target.value })}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${isCompact ? 'text-sm py-1.5' : ''}`}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-${isCompact ? 'xs' : 'sm'} font-medium text-gray-700`}>Access Type</label>
          <select
            value={data.access}
            onChange={(e) => onChange({ ...data, access: e.target.value })}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${isCompact ? 'text-sm py-1.5' : ''}`}
          >
            <option value="REST">REST</option>
            <option value="GraphQL">GraphQL</option>
            <option value="SPARQL">SPARQL</option>
          </select>
        </div>

        <div>
          <label className={`block text-${isCompact ? 'xs' : 'sm'} font-medium text-gray-700`}>Format</label>
          <select
            value={data.format}
            onChange={(e) => onChange({ ...data, format: e.target.value })}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${isCompact ? 'text-sm py-1.5' : ''}`}
          >
            <option value="JSON">JSON</option>
            <option value="CSV">CSV</option>
            <option value="XML">XML</option>
          </select>
        </div>
      </div>
    </div>
  );
};

const NestedOctoForm: React.FC<NestedOctoFormProps> = ({ onClose }) => {
  const { addOcto } = useFirebase();
  const { refreshOctos } = useHive();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    parent: {
      title: '',
      description: '',
      tags: '',
      link: '',
      access: 'REST',
      format: 'JSON'
    },
    children: Array(6).fill(null).map(() => ({
      title: '',
      description: '',
      tags: '',
      link: '',
      access: 'REST',
      format: 'JSON'
    }))
  });

  const steps = [
    { title: 'Octo Parent', subtitle: 'Configuration du centre' },
    ...Array(6).fill(null).map((_, i) => ({ 
      title: `Octo ${i + 1}`, 
      subtitle: `Configuration satellite ${i + 1}` 
    }))
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const nestedGroupId = crypto.randomUUID();
      
      // Ajouter l'octo parent
      const parentTags = formData.parent.tags.split(',').map((tag: string) => tag.trim()).filter(tag => tag);
      const parentId = await addOcto({
        ...formData.parent,
        tags: parentTags,
        addedAt: new Date().toISOString(),
        isNested: true,
        position: 0,
        nestedGroupId
      });

      // Ajouter les octos enfants
      for (let i = 0; i < 6; i++) {
        if (formData.children[i].title.trim()) {
          const childTags = formData.children[i].tags.split(',').map(tag => tag.trim()).filter(tag => tag);
          await addOcto({
            ...formData.children[i],
            tags: childTags,
            addedAt: new Date().toISOString(),
            isNested: true,
            parentId,
            position: i + 1,
            nestedGroupId
          });
        }
      }

      await refreshOctos();
      onClose();
    } catch (error) {
      console.error('Error adding nested octos:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = (step: number) => {
    if (step === 0) {
      return formData.parent.title.trim() && formData.parent.description.trim();
    }
    return true; // Les enfants sont optionnels
  };

  const canProceed = () => {
    return currentStep === 0 ? isStepValid(0) : true;
  };

  const getCurrentData = () => {
    return currentStep === 0 ? formData.parent : formData.children[currentStep - 1];
  };

  const updateCurrentData = (data: OctoFormData) => {
    if (currentStep === 0) {
      setFormData({ ...formData, parent: data });
    } else {
      const newChildren = [...formData.children];
      newChildren[currentStep - 1] = data;
      setFormData({ ...formData, children: newChildren });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-primary-500 text-white rounded-t-lg">
          <div>
            <h2 className="text-xl font-bold">{steps[currentStep].title}</h2>
            <p className="text-primary-100 text-sm">{steps[currentStep].subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary-600 rounded-full transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-4 py-2 bg-gray-50 border-b">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span>Étape {currentStep + 1} sur {steps.length}</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-md mx-auto">
              {currentStep === 0 && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-2">Octo Parent (Centre)</h3>
                  <p className="text-sm text-blue-600">
                    Cet octo sera placé au centre de votre groupe hexagonal. Il représente le thème principal.
                  </p>
                </div>
              )}
              
              {currentStep > 0 && (
                <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-2">Octo Satellite {currentStep}</h3>
                  <p className="text-sm text-green-600">
                    Cet octo sera placé autour du centre. Vous pouvez le laisser vide si vous n'avez pas de données pour cette position.
                  </p>
                </div>
              )}

              <OctoFormFields
                data={getCurrentData()}
                onChange={updateCurrentData}
                isCompact={true}
              />
            </div>
          </div>

          {/* Navigation Footer */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0 || isSubmitting}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Précédent
              </button>

              <div className="flex items-center space-x-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentStep 
                        ? 'bg-primary-500' 
                        : index < currentStep 
                          ? 'bg-green-500' 
                          : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!canProceed() || isSubmitting}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!isStepValid(0) || isSubmitting}
                  className="flex items-center px-6 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Création...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Créer le Groupe
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NestedOctoForm;