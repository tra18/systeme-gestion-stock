import React, { useState } from 'react';
import AdvancedDashboard from '../components/dashboard/AdvancedDashboard';

const DashboardSimple = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Tableau de Bord
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Vue d'ensemble de votre entreprise
        </p>
      </div>

      {/* Navigation par onglets */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Vue d'ensemble
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'advanced'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Tableau de bord avancé
          </button>
        </div>
      </div>

      {/* Contenu selon l'onglet */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Vue d'ensemble</h2>
          <p className="text-gray-600">
            Cette vue d'ensemble sera développée avec des statistiques de base.
          </p>
        </div>
      )}

      {activeTab === 'advanced' && (
        <AdvancedDashboard />
      )}
    </div>
  );
};

export default DashboardSimple;
