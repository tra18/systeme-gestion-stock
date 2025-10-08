import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Users, 
  ShoppingCart, 
  AlertTriangle,
  Download,
  FileText,
  BarChart3,
  PieChart
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdvancedDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stock: [],
    commandes: [],
    employes: [],
    articles: [],
    fournisseurs: []
  });

  // États pour les graphiques
  const [stockChartData, setStockChartData] = useState(null);
  const [commandesChartData, setCommandesChartData] = useState(null);
  const [servicesChartData, setServicesChartData] = useState(null);
  const [budgetChartData, setBudgetChartData] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Charger toutes les données en parallèle
      const [stockSnapshot, commandesSnapshot, employesSnapshot, articlesSnapshot, fournisseursSnapshot] = await Promise.all([
        getDocs(collection(db, 'stock')),
        getDocs(collection(db, 'commandes')),
        getDocs(collection(db, 'employes')),
        getDocs(collection(db, 'articles')),
        getDocs(collection(db, 'fournisseurs'))
      ]);

      const stock = stockSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const commandes = commandesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const employes = employesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const articles = articlesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const fournisseurs = fournisseursSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setDashboardData({ stock, commandes, employes, articles, fournisseurs });
      
      // Générer les données des graphiques
      generateChartsData({ stock, commandes, employes, articles, fournisseurs });
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement du tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  const generateChartsData = (data) => {
    // Graphique des mouvements de stock
    const stockMovements = generateStockMovements(data.stock);
    setStockChartData({
      labels: stockMovements.labels,
      datasets: [
        {
          label: 'Stock Disponible',
          data: stockMovements.stock,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        },
        {
          label: 'Seuil Minimum',
          data: stockMovements.seuils,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4
        }
      ]
    });

    // Graphique des commandes par statut
    const commandesByStatus = generateCommandesByStatus(data.commandes);
    setCommandesChartData({
      labels: commandesByStatus.labels,
      datasets: [
        {
          label: 'Nombre de commandes',
          data: commandesByStatus.data,
          backgroundColor: [
            'rgba(255, 206, 86, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 99, 132, 0.8)'
          ],
          borderColor: [
            'rgba(255, 206, 86, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 2
        }
      ]
    });

    // Graphique des commandes par service
    const commandesByService = generateCommandesByService(data.commandes);
    setServicesChartData({
      labels: commandesByService.labels,
      datasets: [
        {
          label: 'Commandes par service',
          data: commandesByService.data,
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1
        }
      ]
    });

    // Graphique des budgets
    const budgetData = generateBudgetData(data.commandes);
    setBudgetChartData({
      labels: budgetData.labels,
      datasets: [
        {
          label: 'Budget Utilisé (GNF)',
          data: budgetData.data,
          backgroundColor: 'rgba(168, 85, 247, 0.8)',
          borderColor: 'rgba(168, 85, 247, 1)',
          borderWidth: 2
        }
      ]
    });
  };

  // Fonctions utilitaires pour générer les données des graphiques
  const generateStockMovements = (stock) => {
    const labels = stock.slice(0, 10).map(item => item.nom?.substring(0, 15) || 'Article');
    const stockValues = stock.slice(0, 10).map(item => item.quantite || 0);
    const seuils = stock.slice(0, 10).map(item => item.seuilMinimum || 0);
    
    return { labels, stock: stockValues, seuils };
  };

  const generateCommandesByStatus = (commandes) => {
    const statusCount = commandes.reduce((acc, cmd) => {
      const status = cmd.statut || 'inconnu';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(statusCount),
      data: Object.values(statusCount)
    };
  };

  const generateCommandesByService = (commandes) => {
    const serviceCount = commandes.reduce((acc, cmd) => {
      const service = cmd.service || 'Non défini';
      acc[service] = (acc[service] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(serviceCount),
      data: Object.values(serviceCount)
    };
  };

  const generateBudgetData = (commandes) => {
    const serviceBudget = commandes.reduce((acc, cmd) => {
      const service = cmd.service || 'Non défini';
      const prix = parseFloat(cmd.prix) || 0;
      acc[service] = (acc[service] || 0) + prix;
      return acc;
    }, {});

    return {
      labels: Object.keys(serviceBudget),
      data: Object.values(serviceBudget)
    };
  };

  // Fonctions d'export
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Titre
    doc.setFontSize(20);
    doc.text('Rapport de Gestion - Tableau de Bord', 20, 20);
    
    // Données du stock
    doc.setFontSize(16);
    doc.text('État du Stock', 20, 40);
    
    const stockData = dashboardData.stock.map(item => [
      item.nom || 'N/A',
      item.quantite || 0,
      item.seuilMinimum || 0,
      item.prixUnitaire ? `${item.prixUnitaire} GNF` : 'N/A'
    ]);
    
    doc.autoTable({
      head: [['Article', 'Quantité', 'Seuil Min', 'Prix Unitaire']],
      body: stockData,
      startY: 50
    });
    
    // Données des commandes
    doc.setFontSize(16);
    doc.text('Commandes Récentes', 20, doc.lastAutoTable.finalY + 20);
    
    const commandesData = dashboardData.commandes.slice(0, 10).map(cmd => [
      cmd.article || 'N/A',
      cmd.service || 'N/A',
      cmd.quantite || 0,
      cmd.statut || 'N/A',
      cmd.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'
    ]);
    
    doc.autoTable({
      head: [['Article', 'Service', 'Quantité', 'Statut', 'Date']],
      body: commandesData,
      startY: doc.lastAutoTable.finalY + 30
    });
    
    doc.save('rapport-gestion.pdf');
    toast.success('Rapport PDF généré avec succès');
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Feuille Stock
    const stockWS = XLSX.utils.json_to_sheet(
      dashboardData.stock.map(item => ({
        'Article': item.nom,
        'Quantité': item.quantite,
        'Seuil Minimum': item.seuilMinimum,
        'Prix Unitaire': item.prixUnitaire,
        'Catégorie': item.categorie
      }))
    );
    XLSX.utils.book_append_sheet(wb, stockWS, 'Stock');
    
    // Feuille Commandes
    const commandesWS = XLSX.utils.json_to_sheet(
      dashboardData.commandes.map(cmd => ({
        'Article': cmd.article,
        'Service': cmd.service,
        'Quantité': cmd.quantite,
        'Prix': cmd.prix,
        'Statut': cmd.statut,
        'Date': cmd.createdAt?.toDate?.()?.toLocaleDateString()
      }))
    );
    XLSX.utils.book_append_sheet(wb, commandesWS, 'Commandes');
    
    // Feuille Employés
    const employesWS = XLSX.utils.json_to_sheet(
      dashboardData.employes.map(emp => ({
        'Nom': emp.nom,
        'Prénom': emp.prenom,
        'Service': emp.service,
        'Rôle': emp.role,
        'Email': emp.email
      }))
    );
    XLSX.utils.book_append_sheet(wb, employesWS, 'Employés');
    
    XLSX.writeFile(wb, 'rapport-gestion.xlsx');
    toast.success('Rapport Excel généré avec succès');
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

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique des mouvements de stock */}
        {stockChartData && (
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Mouvements de Stock</h3>
            </div>
            <Line 
              data={stockChartData} 
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        )}

        {/* Graphique des commandes par statut */}
        {commandesChartData && (
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold">Commandes par Statut</h3>
            </div>
            <Bar 
              data={commandesChartData} 
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        )}

        {/* Graphique des commandes par service */}
        {servicesChartData && (
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold">Commandes par Service</h3>
            </div>
            <Bar 
              data={servicesChartData} 
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        )}

        {/* Graphique des budgets */}
        {budgetChartData && (
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="h-5 w-5 text-orange-600" />
              <h3 className="text-lg font-semibold">Budget par Service</h3>
            </div>
            <Doughnut 
              data={budgetChartData} 
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </div>
        )}
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

export default AdvancedDashboard;
