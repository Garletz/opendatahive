import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Calendar, DollarSign, Tag, Target, Users, Send, CheckCircle, UserCheck, Clock, Trash2 } from 'lucide-react';
import { useAuth } from '@/context';
import { useFirebase } from '@/context';
import { DataRequest, DataRequestSubmission } from '@/types';
import { formatDate } from '@/utils';

interface DataRequestDetailModalProps {
  request: DataRequest | null;
  onClose: () => void;
  onRequestDeleted?: () => void;
}

const DataRequestDetailModal: React.FC<DataRequestDetailModalProps> = ({ request, onClose, onRequestDeleted }) => {
  const { user } = useAuth();
  const { updateDataRequest, deleteDataRequest, addDataRequestSubmission, getDataRequestSubmissions } = useFirebase();
  const [showInterestForm, setShowInterestForm] = useState(false);
  const [interestMessage, setInterestMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasExpressedInterest, setHasExpressedInterest] = useState(false);
  const [isSelectingContributor, setIsSelectingContributor] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [requestSubmissions, setRequestSubmissions] = useState<DataRequestSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Charger les soumissions quand la requête change
  useEffect(() => {
    if (request) {
      loadSubmissions();
    }
  }, [request]);

  // Vérifier si l'utilisateur a déjà exprimé son intérêt
  useEffect(() => {
    if (user && requestSubmissions.length > 0) {
      setHasExpressedInterest(requestSubmissions.some(s => s.submitterId === user.id));
    }
  }, [user, requestSubmissions]);

  const loadSubmissions = async () => {
    if (!request) return;
    
    setLoadingSubmissions(true);
    try {
      const submissions = await getDataRequestSubmissions(request.id);
      setRequestSubmissions(submissions);
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleExpressInterest = async () => {
    if (!request || !user) return;

    setIsSubmitting(true);
    try {
      const submission: Omit<DataRequestSubmission, 'id'> = {
        requestId: request.id,
        submitterId: user.id,
        submitterName: user.displayName,
        message: interestMessage,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addDataRequestSubmission(submission);
      await loadSubmissions(); // Recharger les soumissions
      
      setHasExpressedInterest(true);
      setShowInterestForm(false);
      setInterestMessage('');
    } catch (error) {
      console.error('Error expressing interest:', error);
      alert('Error submitting interest. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectContributor = async (submissionId: string, contributorId: string, contributorName: string) => {
    if (!request || !user || user.id !== request.authorId) return;

    setIsSelectingContributor(contributorId);
    try {
      // Mettre à jour la requête avec le contributeur sélectionné
      await updateDataRequest(request.id, {
        status: 'in-progress',
        selectedContributorId: contributorId,
        selectedContributorName: contributorName
      });

      // Mettre à jour la soumission sélectionnée
      const updatedSubmissions = requestSubmissions.map(s => ({
        ...s,
        status: s.id === submissionId ? 'accepted' as const : s.status
      }));
      setRequestSubmissions(updatedSubmissions);

      // Recharger les données pour refléter les changements
      window.location.reload();
    } catch (error) {
      console.error('Error selecting contributor:', error);
      alert('Error selecting contributor. Please try again.');
    } finally {
      setIsSelectingContributor(null);
    }
  };

  const handleDeleteRequest = async () => {
    if (!request || !user || user.id !== request.authorId) return;

    if (!confirm('Are you sure you want to delete this data request? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteDataRequest(request.id);
      if (onRequestDeleted) {
        onRequestDeleted();
      }
      onClose();
    } catch (error) {
      console.error('Error deleting request:', error);
      alert('Error deleting request. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'urgent': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-purple-600 bg-purple-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!request) return null;

  const isRequestOwner = user && user.id === request.authorId;
  const canExpressInterest = user && user.id !== request.authorId && request.status === 'open' && !hasExpressedInterest;
  const isInProgress = request.status === 'in-progress';
  const selectedSubmission = requestSubmissions.find(s => s.status === 'accepted');

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden"
          style={{
            boxShadow: '0 25px 50px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white p-6 flex-shrink-0">
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              {isRequestOwner && (
                <button
                  onClick={handleDeleteRequest}
                  disabled={isDeleting}
                  className="p-2 rounded-full hover:bg-red-500/20 transition-colors text-red-200 hover:text-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete request"
                >
                  {isDeleting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Trash2 className="h-5 w-5" />
                  )}
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex items-start gap-4 pr-12">
              <div className="p-3 rounded-lg bg-white/20 flex-shrink-0">
                <Target className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h2 className="font-heading font-bold text-2xl mb-2">{request.title}</h2>
                <div className="flex items-center gap-3 text-amber-100">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(request.priority)} text-amber-800`}>
                    {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)} Priority
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)} text-amber-800`}>
                    {request.status.replace('-', ' ').charAt(0).toUpperCase() + request.status.replace('-', ' ').slice(1)}
                  </span>
                  {request.budget && (
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                      💰 €{request.budget.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Objective */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="h-5 w-5 text-amber-600" />
                    Objective
                  </h3>
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-200">
                    {request.objective}
                  </p>
                </div>

                {/* Description */}
                {request.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Detailed Description</h3>
                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-200">
                      {request.description}
                    </p>
                  </div>
                )}

                {/* Requirements */}
                {request.requirements && request.requirements.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                    <ul className="space-y-2">
                      {request.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-700">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tags */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Tag className="h-5 w-5 text-blue-600" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {request.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Interested Contributors */}
                {requestSubmissions.length > 0 && request.status === 'open' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-600" />
                      {isRequestOwner ? 'Select a Contributor' : 'Interested Contributors'} ({requestSubmissions.length})
                    </h3>
                    {loadingSubmissions ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {requestSubmissions.map((submission) => (
                          <div key={submission.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                            <div className="flex items-start justify-between mb-2">
                              <span className="font-medium text-gray-900">{submission.submitterName}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">{formatDate(submission.createdAt)}</span>
                                {isRequestOwner && (
                                  <button
                                    onClick={() => handleSelectContributor(submission.id, submission.submitterId, submission.submitterName)}
                                    disabled={isSelectingContributor === submission.submitterId}
                                    className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {isSelectingContributor === submission.submitterId ? (
                                      <>
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                        Selecting...
                                      </>
                                    ) : (
                                      <>
                                        <UserCheck className="h-3 w-3" />
                                        Select
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                            {submission.message && (
                              <p className="text-gray-700 text-sm">{submission.message}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Selected Contributor (when in progress) */}
                {isInProgress && selectedSubmission && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      Work in Progress
                    </h3>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <UserCheck className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-blue-900">{selectedSubmission.submitterName}</span>
                        <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded-full text-xs font-medium">Selected</span>
                      </div>
                      {selectedSubmission.message && (
                        <p className="text-blue-800 text-sm">{selectedSubmission.message}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Contact Information */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Mail className="h-5 w-5 text-green-600" />
                    Contact
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Requester:</span>
                      <p className="font-medium text-gray-900">{request.authorName}</p>
                    </div>
                    {request.contactEmail && (
                      <div>
                        <span className="text-sm text-gray-600">Email:</span>
                        <a 
                          href={`mailto:${request.contactEmail}`}
                          className="block font-medium text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          {request.contactEmail}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Project Details */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Details</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Domain:</span>
                      <p className="font-medium text-gray-900 capitalize">{request.domain}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Desired Format:</span>
                      <p className="font-medium text-gray-900">{request.desiredFormat}</p>
                    </div>
                    {request.deadline && (
                      <div>
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Deadline:
                        </span>
                        <p className="font-medium text-gray-900">{formatDate(request.deadline)}</p>
                      </div>
                    )}
                    {request.budget && (
                      <div>
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          Budget:
                        </span>
                        <p className="font-medium text-green-600">€{request.budget.toLocaleString()}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-sm text-gray-600">Created:</span>
                      <p className="font-medium text-gray-900">{formatDate(request.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Express Interest */}
                {user && (
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200">
                    <h3 className="text-lg font-semibold text-amber-800 mb-3">
                      {isInProgress ? 'Request Status' : 'Interested in this request?'}
                    </h3>
                    
                    {isInProgress ? (
                      <div className="text-center py-4">
                        <Clock className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                        <p className="text-blue-700 font-medium">Work in Progress</p>
                        <p className="text-sm text-blue-600 mt-1">
                          {request.selectedContributorName} is working on this request.
                        </p>
                        {user.id === request.selectedContributorId && (
                          <div className="mt-3 p-3 bg-blue-100 rounded-lg">
                            <p className="text-blue-800 font-medium">You're working on this request!</p>
                            <p className="text-sm text-blue-700 mt-1">
                              Contact the requester for any questions.
                            </p>
                          </div>
                        )}
                      </div>
                    ) : hasExpressedInterest ? (
                      <div className="text-center py-4">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                        <p className="text-green-700 font-medium">You've expressed interest!</p>
                        <p className="text-sm text-green-600 mt-1">
                          The requester can now contact you via email.
                        </p>
                      </div>
                    ) : canExpressInterest && showInterestForm ? (
                      <div className="space-y-3">
                        <textarea
                          value={interestMessage}
                          onChange={(e) => setInterestMessage(e.target.value)}
                          placeholder="Tell the requester about your expertise and how you can help..."
                          className="w-full p-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
                          rows={4}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleExpressInterest}
                            disabled={isSubmitting}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Submitting...
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4" />
                                Express Interest
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => setShowInterestForm(false)}
                            className="px-4 py-2 text-amber-700 border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : canExpressInterest ? (
                      <button
                        onClick={() => setShowInterestForm(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                      >
                        <Users className="h-5 w-5" />
                        I'm Interested
                      </button>
                    ) : user.id === request.authorId ? (
                      <div className="text-center py-4">
                        <Target className="h-12 w-12 text-amber-600 mx-auto mb-2" />
                        <p className="text-amber-700 font-medium">This is your request</p>
                        <p className="text-sm text-amber-600 mt-1">
                          {request.status === 'open' && requestSubmissions.length > 0
                            ? 'Select a contributor from the interested users above.'
                            : 'Waiting for contributors to express interest.'}
                        </p>
                      </div>
                    ) : request.status !== 'open' ? (
                      <div className="text-center py-4">
                        <X className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                        <p className="text-gray-700 font-medium">Request not available</p>
                        <p className="text-sm text-gray-600 mt-1">
                          This request is no longer accepting new contributors.
                        </p>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DataRequestDetailModal;