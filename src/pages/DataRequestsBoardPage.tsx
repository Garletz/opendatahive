import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Search, Eye, EyeOff, Calendar, DollarSign, Users } from 'lucide-react';
import { useFirebase } from '@/context';
import { useAuth } from '@/context';
import { DataRequest } from '@/types';
import ProposeDataForm from '../components/dataRequests/ProposeDataForm';
import DataRequestDetailModal from '../components/dataRequests/DataRequestDetailModal';
import { formatDate } from '@/utils';
import '../styles/dataBoard.css';

interface DataRequestsBoardPageProps {
  onBack: () => void;
}

const DataRequestsBoardPage: React.FC<DataRequestsBoardPageProps> = ({ onBack }) => {
  const { getDataRequests } = useFirebase();
  const { user } = useAuth();
  const [dataRequests, setDataRequests] = useState<DataRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'public' | 'my-requests' | 'my-work'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<DataRequest | null>(null);

  useEffect(() => {
    loadDataRequests();
    // Nettoyer les requêtes expirées au chargement
    cleanupExpiredRequests();
  }, [user]);

  // Fonction pour nettoyer les requêtes expirées
  const cleanupExpiredRequests = async () => {
    if (!user) return;
    
    try {
      const allRequests = await getDataRequests();
      const now = new Date();
      
      for (const request of allRequests) {
        let shouldDelete = false;
        
        if (request.deadline) {
          // Si une deadline est définie et qu'elle est dépassée
          const deadline = new Date(request.deadline);
          if (now > deadline) {
            shouldDelete = true;
          }
        } else {
          // Si pas de deadline, supprimer après 100 jours
          const createdDate = new Date(request.createdAt);
          const daysSinceCreated = (now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24);
          if (daysSinceCreated > 100) {
            shouldDelete = true;
          }
        }
        
        if (shouldDelete) {
          console.log(`Deleting expired request: ${request.title}`);
          // await deleteDataRequest(request.id); // Fonction non définie
        }
      }
    } catch (error) {
      console.error('Error cleaning up expired requests:', error);
    }
  };

  const loadDataRequests = async () => {
    try {
      setLoading(true);
      const requests = await getDataRequests();
      setDataRequests(requests);
    } catch (error) {
      console.error('Error loading data requests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter requests based on current filter and search
  const filteredRequests = dataRequests.filter(request => {
    // Filter by visibility and ownership
    if (filter === 'public' && !request.isPublic) return false;
    if (filter === 'my-requests' && (!user || request.authorId !== user.id)) return false;
    // if (filter === 'my-work' && (!user || request.selectedContributorId !== user.id)) return false;
    if (!user && !request.isPublic) return false; // Non-logged users see only public

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (!request.title.toLowerCase().includes(searchLower) &&
          !request.objective.toLowerCase().includes(searchLower) &&
          !request.tags.some(tag => tag.toLowerCase().includes(searchLower))) {
        return false;
      }
    }

    // Domain filter
    if (selectedDomain && request.domain !== selectedDomain) return false;

    return true;
  });

  // Get unique domains for filter
  const domains = Array.from(new Set(dataRequests.map(r => r.domain))).sort();

  // Predefined paper angles for visual variety
  const paperAngles = [-7, 5, 2, -4, 8, -6, 3, -2, 6, -5, 4, -3];

  const getPaperAngle = (index: number) => {
    return paperAngles[index % paperAngles.length];
  };

  const handleRequestClick = (request: DataRequest) => {
    setSelectedRequest(request);
  };

  const handleRequestDeleted = () => {
    loadDataRequests();
    setSelectedRequest(null);
  };

  const handleFormSuccess = () => {
    loadDataRequests();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'open';
      case 'in-progress': return 'in-progress';
      case 'completed': return 'completed';
      default: return 'open';
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'low': return 'low';
      case 'medium': return 'medium';
      case 'high': return 'high';
      case 'urgent': return 'urgent';
      default: return 'medium';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <motion.button
              onClick={onBack}
              className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </motion.button>
            <div>
              <h1 className="text-3xl font-heading font-bold text-amber-800">Data Bounty Board</h1>
              <p className="text-amber-600">Request specific datasets or submit solutions</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
              />
            </div>

            {/* Domain Filter */}
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
            >
              <option value="">All Domains</option>
              {domains.map(domain => (
                <option key={domain} value={domain}>
                  {domain.charAt(0).toUpperCase() + domain.slice(1)}
                </option>
              ))}
            </select>

            {/* Visibility Filter */}
            <div className="flex items-center gap-2 bg-white rounded-lg shadow-md p-1">
              {[
                { key: 'all', label: 'All', count: filteredRequests.length },
                { key: 'public', label: 'Public', count: dataRequests.filter(r => r.isPublic).length },
                ...(user ? [
                  { key: 'my-requests', label: 'Mine', count: dataRequests.filter(r => r.authorId === user.id).length },
                  // { key: 'my-work', label: 'My Work', count: dataRequests.filter(r => r.selectedContributorId === user.id).length }
                ] : [])
              ].map(({ key, label, count }) => (
                <motion.button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    filter === key
                      ? key === 'my-work' 
                        ? 'bg-indigo-500 text-white shadow-md'
                        : 'bg-amber-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {label} ({count})
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quest Board */}
        <motion.div 
          className="quest-board-container"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Decorative vines */}
          <div className="vines">
            <svg viewBox="0 0 1200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10,40 Q60,10 120,40 T240,40 T360,40 T480,40 T600,40 T720,40 T840,40 T960,40 T1080,40 T1190,20" stroke="#4e8c3a" strokeWidth="7" fill="none"/>
              <ellipse cx="60" cy="20" rx="12" ry="7" fill="#6fcf5b"/>
              <ellipse cx="120" cy="45" rx="10" ry="6" fill="#6fcf5b"/>
              <ellipse cx="240" cy="25" rx="11" ry="6" fill="#6fcf5b"/>
              <ellipse cx="360" cy="45" rx="10" ry="6" fill="#6fcf5b"/>
              <ellipse cx="480" cy="20" rx="12" ry="7" fill="#6fcf5b"/>
              <ellipse cx="600" cy="45" rx="9" ry="5" fill="#6fcf5b"/>
              <ellipse cx="720" cy="25" rx="11" ry="6" fill="#6fcf5b"/>
              <ellipse cx="840" cy="40" rx="10" ry="6" fill="#6fcf5b"/>
              <ellipse cx="960" cy="20" rx="12" ry="7" fill="#6fcf5b"/>
              <ellipse cx="1080" cy="45" rx="10" ry="6" fill="#6fcf5b"/>
            </svg>
          </div>

          <div className="wood-frame">
            <div className="board-title-panel">
              <span>📋 DATA BOUNTY REQUESTS</span>
            </div>

            <div className="quest-papers">
              {loading ? (
                <div className="flex items-center justify-center w-full py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="empty-board">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold mb-2">No data requests found</h3>
                  <p className="text-center">
                    {searchTerm || selectedDomain ? 
                      'Try adjusting your search filters' : 
                      'Be the first to post a data bounty request!'
                    }
                  </p>
                </div>
              ) : (
                filteredRequests.map((request, index) => (
                  <motion.div
                    key={request.id}
                    className="paper"
                    style={{ '--angle': `${getPaperAngle(index)}deg` } as React.CSSProperties}
                    initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1, 
                      rotate: getPaperAngle(index)
                    }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ 
                      scale: 1.05, 
                      rotate: 0,
                      zIndex: 10
                    }}
                    onClick={() => handleRequestClick(request)}
                  >
                    {/* Priority indicator */}
                    <div className={`paper-priority ${getPriorityClass(request.priority)}`}></div>

                    <div className="paper-title">{request.title}</div>
                    <div className="paper-desc">{request.objective}</div>
                    
                    {/* Tags */}
                    {request.tags.length > 0 && (
                      <div className="paper-tags">
                        {request.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="paper-tag">{tag}</span>
                        ))}
                        {request.tags.length > 3 && (
                          <span className="paper-tag">+{request.tags.length - 3}</span>
                        )}
                      </div>
                    )}

                    {/* Budget */}
                    {request.budget && (
                      <div className="paper-budget">
                        💰 €{request.budget.toLocaleString()}
                      </div>
                    )}

                    <div className="paper-meta">
                      <div className={`paper-status ${getStatusColor(request.status)}`}>
                        {request.status.replace('-', ' ')}
                      </div>
                      <div>📅 {formatDate(request.createdAt)}</div>
                      <div>👤 {request.authorName}</div>
                      {request.deadline && (
                        <div>⏰ Due: {formatDate(request.deadline)}</div>
                      )}
                      <div className="flex items-center gap-1 text-xs">
                        {request.isPublic ? (
                          <>
                            <Eye className="h-3 w-3" />
                            <span>Public</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3" />
                            <span>Private</span>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Statistics */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-white rounded-xl shadow-lg p-6 border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Requests</p>
                <p className="text-2xl font-bold text-amber-600">
                  {dataRequests.filter(r => r.status === 'open').length}
                </p>
              </div>
              <div className="p-3 bg-amber-100 rounded-full">
                <Calendar className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">People Working</p>
                <p className="text-2xl font-bold text-blue-600">
                  {dataRequests.filter(r => r.status === 'in-progress').length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bounty</p>
                <p className="text-2xl font-bold text-green-600">
                  €{dataRequests.reduce((sum, r) => sum + (r.budget || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating Add Button */}
      {user && (
        <motion.button
          onClick={() => setShowForm(true)}
          className="floating-add-button"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 300 }}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          title="Propose a new data request"
        >
          <Plus className="h-8 w-8 text-amber-800" />
        </motion.button>
      )}

      {/* Data Request Detail Modal */}
      <DataRequestDetailModal 
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onRequestDeleted={handleRequestDeleted}
      />

      {/* Propose Data Form Modal */}
      <AnimatePresence>
        {showForm && (
          <ProposeDataForm 
            onClose={() => setShowForm(false)}
            onSuccess={handleFormSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DataRequestsBoardPage;