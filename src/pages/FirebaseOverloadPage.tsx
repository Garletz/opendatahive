import React from 'react';

const FirebaseOverloadPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-2xl p-8 text-center">
        {/* Header */}
        <div className="mb-8">
          <div className="text-6xl mb-4">🚀</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            We're experiencing high traffic!
          </h1>
          <p className="text-lg text-gray-600">
            Our servers are currently overloaded with users and AI requests
          </p>
        </div>

        {/* Main content */}
        <div className="space-y-6 mb-8">
          <div className="bg-orange-50 border-l-4 border-orange-400 p-4 text-left">
            <p className="text-orange-800">
              <strong>What's happening?</strong><br />
              We have too many users and AI systems overloading our platform. 
              We're scaling our infrastructure to handle the increased demand.
            </p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 text-left">
            <p className="text-blue-800">
              <strong>Our solution:</strong><br />
              We're adapting our storage capacity based on our budget and actively 
              seeking a partner platform for centralized data storage or a no-bullshit 
              blockchain storage solution.
            </p>
          </div>

          <div className="bg-green-50 border-l-4 border-green-400 p-4 text-left">
            <p className="text-green-800">
              <strong>Thank you for your understanding!</strong><br />
              Please try accessing the site again in about 1 hour. 
              We're working hard to get everything back to normal.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-4">
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105"
          >
            🔄 Try Again Now
          </button>
          
          <div className="text-sm text-gray-500">
            <p>Expected resolution time: ~1 hour</p>
            <p className="mt-1">Current time: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            OpenDataHive
          </p>
        </div>
      </div>
    </div>
  );
};

export default FirebaseOverloadPage; 