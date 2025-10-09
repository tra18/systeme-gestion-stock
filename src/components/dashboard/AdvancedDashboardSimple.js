import React, { useState, useEffect } from 'react';
import {
  TrendingUp, 
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
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

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
    try {
      const doc = new jsPDF();
      
      // Titre
      doc.setFontSize(20);
      doc.text('Tableau de Bord Avancé', 14, 20);
      doc.setFontSize(10);
      doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 14, 28);
      
      // Métriques principales
      doc.setFontSize(14);
      doc.text('Métriques Principales', 14, 40);
      
      const metricsData = [
        ['Articles en Stock', dashboardData.stock.length],
        ['Commandes Total', dashboardData.commandes.length],
        ['Employés', dashboardData.employes.length],
        ['Alertes Stock', dashboardData.stock.filter(item => (item.quantite || 0) <= (item.seuilMinimum || 0)).length]
      ];
      
      doc.autoTable({
        startY: 45,
        head: [['Catégorie', 'Valeur']],
        body: metricsData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] }
      });
      
      // Commandes par statut
      const yPos = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.text('Commandes par Statut', 14, yPos);
      
      const statutCounts = {
        'en_attente_prix': 0,
        'en_attente_approbation': 0,
        'approuve': 0,
        'rejete': 0
      };
      
      dashboardData.commandes.forEach(cmd => {
        const statut = cmd.statut || 'en_attente_prix';
        statutCounts[statut] = (statutCounts[statut] || 0) + 1;
      });
      
      const statutData = Object.entries(statutCounts).map(([statut, count]) => {
        const labels = {
          'en_attente_prix': 'En attente prix',
          'en_attente_approbation': 'En attente approbation',
          'approuve': 'Approuvé',
          'rejete': 'Rejeté'
        };
        return [labels[statut] || statut, count];
      });
      
      doc.autoTable({
        startY: yPos + 5,
        head: [['Statut', 'Nombre']],
        body: statutData,
        theme: 'striped',
        headStyles: { fillColor: [34, 197, 94] }
      });
      
      // Articles en stock faible
      const stockFaible = dashboardData.stock.filter(item => (item.quantite || 0) <= (item.seuilMinimum || 0));
      if (stockFaible.length > 0) {
        const yPos2 = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(14);
        doc.text('Alertes Stock Faible', 14, yPos2);
        
        const stockFaibleData = stockFaible.slice(0, 10).map(item => [
          item.nom || 'N/A',
          item.quantite || 0,
          item.seuilMinimum || 0
        ]);
        
        doc.autoTable({
          startY: yPos2 + 5,
          head: [['Article', 'Quantité', 'Seuil Min']],
          body: stockFaibleData,
          theme: 'grid',
          headStyles: { fillColor: [239, 68, 68] }
        });
      }
      
      doc.save(`tableau-de-bord-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('✅ PDF exporté avec succès');
    } catch (error) {
      console.error('Erreur export PDF:', error);
      toast.error('❌ Erreur lors de l\'export PDF');
    }
  };

  const exportToExcel = () => {
    try {
      // Créer un workbook
      const wb = XLSX.utils.book_new();
      
      // Feuille 1: Métriques
      const metricsData = [
        ['Catégorie', 'Valeur'],
        ['Articles en Stock', dashboardData.stock.length],
        ['Commandes Total', dashboardData.commandes.length],
        ['Employés', dashboardData.employes.length],
        ['Alertes Stock', dashboardData.stock.filter(item => (item.quantite || 0) <= (item.seuilMinimum || 0)).length]
      ];
      const ws1 = XLSX.utils.aoa_to_sheet(metricsData);
      XLSX.utils.book_append_sheet(wb, ws1, 'Métriques');
      
      // Feuille 2: Stock
      const stockData = dashboardData.stock.map(item => ({
        'Nom': item.nom || 'N/A',
        'Catégorie': item.categorie || 'N/A',
        'Quantité': item.quantite || 0,
        'Seuil Minimum': item.seuilMinimum || 0,
        'Unité': item.unite || 'N/A',
        'Localisation': item.localisation || 'N/A'
      }));
      const ws2 = XLSX.utils.json_to_sheet(stockData);
      XLSX.utils.book_append_sheet(wb, ws2, 'Stock');
      
      // Feuille 3: Commandes
      const commandesData = dashboardData.commandes.map(cmd => ({
        'Service': cmd.service || 'N/A',
        'Statut': cmd.statut || 'en_attente_prix',
        'Prix': cmd.prix || 0,
        'Fournisseur': cmd.fournisseur || 'N/A',
        'Date': cmd.createdAt?.toDate?.()?.toLocaleDateString('fr-FR') || 'N/A',
        'Demandeur': cmd.createdByName || 'N/A'
      }));
      const ws3 = XLSX.utils.json_to_sheet(commandesData);
      XLSX.utils.book_append_sheet(wb, ws3, 'Commandes');
      
      // Feuille 4: Employés
      const employesData = dashboardData.employes.map(emp => ({
        'Nom': emp.nom || 'N/A',
        'Prénom': emp.prenom || 'N/A',
        'Poste': emp.poste || 'N/A',
        'Service': emp.service || 'N/A',
        'Statut': emp.statut || 'actif',
        'Email': emp.email || 'N/A'
      }));
      const ws4 = XLSX.utils.json_to_sheet(employesData);
      XLSX.utils.book_append_sheet(wb, ws4, 'Employés');
      
      // Sauvegarder
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(data, `tableau-de-bord-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success('✅ Excel exporté avec succès');
    } catch (error) {
      console.error('Erreur export Excel:', error);
      toast.error('❌ Erreur lors de l\'export Excel');
    }
  };

  // Préparer les données pour le graphique des commandes par statut
  const getCommandesParStatutData = () => {
    const statutCounts = {
      'en_attente_prix': 0,
      'en_attente_approbation': 0,
      'approuve': 0,
      'rejete': 0
    };
    
    dashboardData.commandes.forEach(cmd => {
      const statut = cmd.statut || 'en_attente_prix';
      statutCounts[statut] = (statutCounts[statut] || 0) + 1;
    });
    
    return {
      labels: ['En attente prix', 'En attente approbation', 'Approuvé', 'Rejeté'],
      datasets: [{
        label: 'Nombre de commandes',
        data: [
          statutCounts.en_attente_prix,
          statutCounts.en_attente_approbation,
          statutCounts.approuve,
          statutCounts.rejete
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',  // Bleu
          'rgba(251, 191, 36, 0.8)',  // Jaune
          'rgba(34, 197, 94, 0.8)',   // Vert
          'rgba(239, 68, 68, 0.8)'    // Rouge
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(251, 191, 36)',
          'rgb(34, 197, 94)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 2
      }]
    };
  };

  // Préparer les données pour le graphique du stock par catégorie
  const getStockParCategorieData = () => {
    const categoryCounts = {};
    
    dashboardData.stock.forEach(item => {
      const categorie = item.categorie || 'Non catégorisé';
      categoryCounts[categorie] = (categoryCounts[categorie] || 0) + 1;
    });
    
    // Prendre les 6 premières catégories
    const sortedCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
    
    return {
      labels: sortedCategories.map(([cat]) => cat),
      datasets: [{
        label: 'Nombre d\'articles',
        data: sortedCategories.map(([, count]) => count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(249, 115, 22, 0.8)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(251, 191, 36)',
          'rgb(168, 85, 247)',
          'rgb(236, 72, 153)',
          'rgb(249, 115, 22)'
        ],
        borderWidth: 2
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: false,
      }
    }
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

      {/* Graphiques interactifs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique du stock par catégorie */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Stock par Catégorie</h3>
          </div>
          <div className="h-64">
            {dashboardData.stock.length > 0 ? (
              <Bar data={getStockParCategorieData()} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Aucune donnée de stock</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Graphique des commandes par statut */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold">Commandes par Statut</h3>
          </div>
          <div className="h-64">
            {dashboardData.commandes.length > 0 ? (
              <Pie data={getCommandesParStatutData()} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Aucune commande</p>
                </div>
              </div>
            )}
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


