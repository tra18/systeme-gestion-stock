import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  AlertTriangle, 
  Settings, 
  BarChart3,
  Users,
  Calendar,
  Clock,
  HardDrive,
  Router,
  Smartphone,
  Printer,
  Laptop
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import ITAssetManager from '../components/it/ITAssetManager';
import IncidentManager from '../components/it/IncidentManager';
import toast from 'react-hot-toast';

const GestionIT = () => {
  const [activeTab, setActiveTab] = useState('assets');
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployes();
  }, []);

  const loadEmployes = async () => {
    try {
      const employesQuery = collection(db, 'employes');
      const snapshot = await getDocs(employesQuery);
      
      const employesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setEmployes(employesData);
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
      toast.error('Erreur lors du chargement des employés');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'assets', label: 'Parc Informatique', icon: Monitor },
    { id: 'incidents', label: 'Incidents IT', icon: AlertTriangle },
    { id: 'dashboard', label: 'Tableau de Bord', icon: BarChart3 }
  ];

  const TabButton = ({ active, onClick, icon: Icon, label }) => (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
        active
          ? 'border-teal-500 text-teal-600 bg-teal-50'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Tableau de Bord IT</h2>
        <p className="text-gray-600">Vue d'ensemble du parc informatique et des incidents</p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Monitor className="h-8 w-8 text-teal-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Équipements IT</dt>
                <dd className="text-lg font-medium text-gray-900">-</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Incidents Ouverts</dt>
                <dd className="text-lg font-medium text-gray-900">-</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">En Maintenance</dt>
                <dd className="text-lg font-medium text-gray-900">-</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Settings className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Taux de Résolution</dt>
                <dd className="text-lg font-medium text-gray-900">-</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Répartition des équipements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Répartition des Équipements</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-4 w-4 rounded bg-blue-500"></div>
                <span className="text-sm text-gray-600">Ordinateurs de bureau</span>
              </div>
              <span className="text-sm font-medium text-gray-900">-</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-4 w-4 rounded bg-green-500"></div>
                <span className="text-sm text-gray-600">Ordinateurs portables</span>
              </div>
              <span className="text-sm font-medium text-gray-900">-</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-4 w-4 rounded bg-purple-500"></div>
                <span className="text-sm text-gray-600">Smartphones</span>
              </div>
              <span className="text-sm font-medium text-gray-900">-</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-4 w-4 rounded bg-orange-500"></div>
                <span className="text-sm text-gray-600">Imprimantes</span>
              </div>
              <span className="text-sm font-medium text-gray-900">-</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-4 w-4 rounded bg-teal-500"></div>
                <span className="text-sm text-gray-600">Équipements réseau</span>
              </div>
              <span className="text-sm font-medium text-gray-900">-</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Incidents par Priorité</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-4 w-4 rounded bg-red-500"></div>
                <span className="text-sm text-gray-600">Critique</span>
              </div>
              <span className="text-sm font-medium text-gray-900">-</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-4 w-4 rounded bg-orange-500"></div>
                <span className="text-sm text-gray-600">Haute</span>
              </div>
              <span className="text-sm font-medium text-gray-900">-</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-4 w-4 rounded bg-yellow-500"></div>
                <span className="text-sm text-gray-600">Moyenne</span>
              </div>
              <span className="text-sm font-medium text-gray-900">-</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-4 w-4 rounded bg-green-500"></div>
                <span className="text-sm text-gray-600">Basse</span>
              </div>
              <span className="text-sm font-medium text-gray-900">-</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alertes et recommandations */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Alertes et Recommandations</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Garanties expirantes</p>
              <p className="text-sm text-yellow-700">Certains équipements approchent de la fin de garantie</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Settings className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Maintenance préventive</p>
              <p className="text-sm text-blue-700">Planifiez la maintenance des équipements critiques</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <Monitor className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800">Mise à jour des logiciels</p>
              <p className="text-sm text-green-700">Vérifiez les mises à jour de sécurité disponibles</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gestion IT</h1>
          <p className="mt-1 text-sm text-gray-500">
            Parc informatique et gestion des incidents
          </p>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="flex flex-wrap border-b">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              icon={tab.icon}
              label={tab.label}
            />
          ))}
        </div>
      </div>

      {/* Contenu selon l'onglet actif */}
      <div>
        {activeTab === 'assets' && <ITAssetManager employes={employes} />}
        {activeTab === 'incidents' && <IncidentManager employes={employes} />}
        {activeTab === 'dashboard' && renderDashboard()}
      </div>
    </div>
  );
};

export default GestionIT;
