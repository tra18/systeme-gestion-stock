import React, { useState, useEffect } from 'react';
import {
  TrendingUp, 
  TrendingDown, 
  Package, 
  Users, 
  ShoppingCart, 
  AlertTriangle,
  Download,
  FileText,
  BarChart3
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const AdvancedDashboardSimple = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stock: [],
    commandes: [],
    employes: [],
    articles: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Charger toutes les données en parallèle
      const [stockSnapshot, commandesSnapshot, employesSnapshot, articlesSnapshot] = await Promise.all([
        getDocs(collection(db, 'stock')),
        getDocs(collection(db, 'commandes')),
        getDocs(collection(db, 'employes')),
        getDocs(collection(db, 'articles'))
      ]);

      const stock = stockSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const commandes = commandesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const employes = employesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const articles = articlesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setDashboardData({ stock, commandes, employes, articles });
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement du tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    toast.success('Export PDF (fonctionnalité à implémenter)');
  };

  const exportToExcel = () => {
    toast.success('Export Excel (fonctionnalité à implémenter)');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec actions d'export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Avancé</h1>
          <p className="text-gray-600">Analyses et rapports détaillés</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <FileText className="h-4 w-4" />
            Export PDF
          </button>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Articles en Stock</p>
              <p className="text-2xl font-semibold text-gray-900">{dashboardData.stock.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShoppingCart className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Commandes Total</p>
              <p className="text-2xl font-semibold text-gray-900">{dashboardData.commandes.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Employés</p>
              <p className="text-2xl font-semibold text-gray-900">{dashboardData.employes.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Alertes Stock</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardData.stock.filter(item => (item.quantite || 0) <= (item.seuilMinimum || 0)).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques simplifiés */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique des mouvements de stock */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Mouvements de Stock</h3>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Graphique des mouvements de stock</p>
              <p className="text-sm text-gray-400">(Chart.js à implémenter)</p>
            </div>
          </div>
        </div>

        {/* Graphique des commandes par statut */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold">Commandes par Statut</h3>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Graphique des commandes</p>
              <p className="text-sm text-gray-400">(Chart.js à implémenter)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau récapitulatif */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Résumé des Données</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière Mise à Jour
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Articles en Stock
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {dashboardData.stock.length}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date().toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Actif
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Commandes
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {dashboardData.commandes.length}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date().toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    En cours
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Employés
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {dashboardData.employes.length}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date().toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                    Géré
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdvancedDashboardSimple;


