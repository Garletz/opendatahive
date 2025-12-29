import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SendHorizontal, X, Bot, Sparkles } from 'lucide-react';
import { useFirebase } from '@/context';
import { useHive } from '@/context';
import { Octo } from '@/types';

interface ArchivistPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ArchivistPanel: React.FC<ArchivistPanelProps> = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ text: string; sender: 'user' | 'ai' }>>([
    { 
      text: "Hello, I'm the Archivist. I can help you add, modify, or explore open data sources. How can I assist you today?",
      sender: 'ai'
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { addOcto } = useFirebase();
  const { refreshOctos } = useHive();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isProcessing) return;

    // Add user message
    const userMessage = message;
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setMessage('');
    setIsProcessing(true);

    // Simulate AI thinking
    setTimeout(async () => {
      // Check if the message is about adding a data source
      if (userMessage.toLowerCase().includes('add') || userMessage.toLowerCase().includes('create') || userMessage.toLowerCase().includes('new source')) {
        // For demo purposes, let's create a sample Octo based on the request
        try {
          // Extract some details from the user message
          const isClimateData = userMessage.toLowerCase().includes('climate');
          const isHealthData = userMessage.toLowerCase().includes('health');
          const isEconomicData = userMessage.toLowerCase().includes('econom');
          const isJSONFormat = userMessage.toLowerCase().includes('json');
          const isCSVFormat = userMessage.toLowerCase().includes('csv');
          const isRESTAccess = userMessage.toLowerCase().includes('rest') || userMessage.toLowerCase().includes('api');
          
          // Create a new Octo based on extracted info
          const newOcto: Omit<Octo, 'id'> = {
            title: isClimateData ? "European Climate Data" : 
                   isHealthData ? "Public Health Statistics" : 
                   isEconomicData ? "Global Economic Indicators" : 
                   "New Data Source",
            description: `Data source added based on your request: "${userMessage}"`,
            tags: [
              ...(isClimateData ? ['climate', 'environment'] : []),
              ...(isHealthData ? ['health', 'medical'] : []),
              ...(isEconomicData ? ['economy', 'finance'] : []),
              'opendata'
            ],
            link: "https://example.com/data",
            format: isJSONFormat ? "JSON" : isCSVFormat ? "CSV" : "API",
            access: isRESTAccess ? "REST" : "GraphQL",
            addedAt: new Date().toISOString(),
            isPublic: true,
            createdAt: '',
            updatedAt: '',
          };
          
          // Add to Firebase
          await addOcto(newOcto);
          await refreshOctos();
          
          // Respond to user
          setMessages(prev => [...prev, { 
            text: `I've added a new data source "${newOcto.title}" with tags ${newOcto.tags.join(', ')}. It's now visible in the hive.`, 
            sender: 'ai' 
          }]);
        } catch (error) {
          console.error('Error adding octo:', error);
          setMessages(prev => [...prev, { 
            text: "I couldn't add this data source. Please try again.", 
            sender: 'ai' 
          }]);
        }
      } else {
        // Generic response for other queries
        setMessages(prev => [...prev, { 
          text: "I understand your request. To add a new data source, please provide details like the topic, desired format (JSON, CSV, etc.) and access type.", 
          sender: 'ai' 
        }]);
      }
      
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 20 }}
          className="absolute top-0 right-0 w-full md:w-96 h-full bg-white/90 backdrop-blur-md shadow-xl border-l border-primary-200 flex flex-col z-20"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-primary-500 text-white">
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6" />
              <h2 className="font-heading font-semibold text-lg">AI Archivist</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-primary-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-primary-500 text-white rounded-tr-none'
                      : 'bg-gray-100 text-gray-800 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </motion.div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg rounded-tl-none">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white/95 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask the AI Archivist..."
                  className="w-full p-3 pr-10 rounded-full border border-gray-300 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                  disabled={isProcessing}
                />
                {message.trim() === '' && (
                  <div className="absolute right-3 top-3 text-gray-400 pointer-events-none">
                    <Sparkles className="h-5 w-5" />
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={!message.trim() || isProcessing}
                className={`p-3 rounded-full ${
                  !message.trim() || isProcessing
                    ? 'bg-gray-200 text-gray-500'
                    : 'bg-primary-500 text-white hover:bg-primary-600 hover:scale-105'
                } transition-all duration-200`}
              >
                <SendHorizontal className="h-5 w-5" />
              </button>
            </div>
            
            {/* Suggestion Chips */}
            <div className="flex flex-wrap gap-2 mt-3 max-h-20 overflow-y-auto">
              <button
                type="button"
                onClick={() => setMessage("Add a source about air quality in Europe in JSON format")}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-primary-100 hover:text-primary-700 transition-colors whitespace-nowrap"
              >
                Air quality data
              </button>
              <button
                type="button"
                onClick={() => setMessage("Search for public health sources")}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-primary-100 hover:text-primary-700 transition-colors whitespace-nowrap"
              >
                Health sources
              </button>
              <button
                type="button"
                onClick={() => setMessage("Add economic indicators source in CSV")}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-primary-100 hover:text-primary-700 transition-colors whitespace-nowrap"
              >
                Economic indicators
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ArchivistPanel;