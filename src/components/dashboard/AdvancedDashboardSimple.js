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
import autoTable from 'jspdf-autotable';
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
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      // Fonction pour ajouter un en-tête professionnel
      const addHeader = () => {
        // Bandeau supérieur avec gradient (simulé avec rectangle)
        doc.setFillColor(59, 130, 246); // Bleu
        doc.rect(0, 0, pageWidth, 35, 'F');
        
        // Titre principal en blanc
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont(undefined, 'bold');
        doc.text('RAPPORT DE GESTION', pageWidth / 2, 15, { align: 'center' });
        
        // Sous-titre
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text('Tableau de Bord Analytique', pageWidth / 2, 25, { align: 'center' });
        
        // Date et heure
        const now = new Date();
        doc.setFontSize(9);
        doc.setTextColor(240, 240, 240);
        doc.text(`Généré le ${now.toLocaleDateString('fr-FR')} à ${now.toLocaleTimeString('fr-FR')}`, pageWidth - 14, 32, { align: 'right' });
        
        // Ligne décorative
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.5);
        doc.line(14, 37, pageWidth - 14, 37);
      };
      
      // Fonction pour ajouter un pied de page
      const addFooter = (pageNum) => {
        doc.setTextColor(128, 128, 128);
        doc.setFontSize(8);
        doc.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text('© Système de Gestion de Stock - Confidentiel', 14, pageHeight - 10);
        doc.text(`${new Date().getFullYear()}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
        
        // Ligne décorative en bas
        doc.setDrawColor(220, 220, 220);
        doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);
      };
      
      // Page 1 - En-tête et métriques
      addHeader();
      
      // Résumé exécutif avec encadré
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('📊 RÉSUMÉ EXÉCUTIF', 14, 50);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text('Aperçu des indicateurs clés de performance de votre organisation', 14, 58);
      
      // Métriques principales avec design professionnel
      const metricsData = [
        ['📦 Articles en Stock', dashboardData.stock.length.toString(), 'Unités disponibles'],
        ['🛒 Commandes Total', dashboardData.commandes.length.toString(), 'Commandes enregistrées'],
        ['👥 Employés', dashboardData.employes.length.toString(), 'Personnel actif'],
        ['⚠️ Alertes Stock', dashboardData.stock.filter(item => (item.quantite || 0) <= (item.seuilMinimum || 0)).length.toString(), 'Articles sous seuil']
      ];
      
      autoTable(doc, {
        startY: 65,
        head: [['Indicateur', 'Valeur', 'Description']],
        body: metricsData,
        theme: 'striped',
        headStyles: { 
          fillColor: [59, 130, 246],
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 10,
          textColor: [50, 50, 50]
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        },
        columnStyles: {
          0: { cellWidth: 70, fontStyle: 'bold' },
          1: { cellWidth: 30, halign: 'center', textColor: [59, 130, 246], fontStyle: 'bold', fontSize: 12 },
          2: { cellWidth: 80, textColor: [100, 100, 100], fontSize: 9 }
        },
        margin: { left: 14, right: 14 }
      });
      
      // Section Commandes par statut
      const yPos = doc.lastAutoTable.finalY + 20;
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(50, 50, 50);
      doc.text('📈 ANALYSE DES COMMANDES', 14, yPos);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text('Répartition des commandes selon leur état de traitement', 14, yPos + 8);
      
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
      
      const total = dashboardData.commandes.length;
      const statutData = Object.entries(statutCounts).map(([statut, count]) => {
        const labels = {
          'en_attente_prix': '⏳ En attente prix',
          'en_attente_approbation': '⏰ En attente approbation',
          'approuve': '✅ Approuvé',
          'rejete': '❌ Rejeté'
        };
        const percentage = total > 0 ? ((count / total) * 100).toFixed(1) + '%' : '0%';
        return [labels[statut] || statut, count.toString(), percentage];
      });
      
      autoTable(doc, {
        startY: yPos + 15,
        head: [['Statut', 'Nombre', 'Pourcentage']],
        body: statutData,
        theme: 'grid',
        headStyles: { 
          fillColor: [34, 197, 94],
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 10
        },
        columnStyles: {
          0: { cellWidth: 90 },
          1: { cellWidth: 40, halign: 'center', fontStyle: 'bold', textColor: [34, 197, 94] },
          2: { cellWidth: 50, halign: 'center', textColor: [100, 100, 100] }
        },
        margin: { left: 14, right: 14 }
      });
      
      // Section Alertes stock faible
      const stockFaible = dashboardData.stock.filter(item => (item.quantite || 0) <= (item.seuilMinimum || 0));
      
      if (stockFaible.length > 0) {
        const yPos2 = doc.lastAutoTable.finalY + 20;
        
        // Nouvelle page si nécessaire
        if (yPos2 > pageHeight - 80) {
          doc.addPage();
          addHeader();
          doc.setFontSize(16);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(50, 50, 50);
          doc.text('⚠️ ALERTES STOCK CRITIQUE', 14, 50);
        } else {
          doc.setFontSize(16);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(50, 50, 50);
          doc.text('⚠️ ALERTES STOCK CRITIQUE', 14, yPos2);
        }
        
        const startY = yPos2 > pageHeight - 80 ? 58 : yPos2 + 8;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(200, 50, 50);
        doc.text(`${stockFaible.length} article(s) nécessite(nt) une attention immédiate`, 14, startY);
        
        const stockFaibleData = stockFaible.slice(0, 15).map(item => {
          const diff = (item.seuilMinimum || 0) - (item.quantite || 0);
          const urgence = diff > 10 ? '🔴 Urgent' : diff > 5 ? '🟠 Important' : '🟡 À surveiller';
          return [
            item.nom || 'N/A',
            (item.quantite || 0).toString(),
            (item.seuilMinimum || 0).toString(),
            urgence
          ];
        });
        
        autoTable(doc, {
          startY: startY + 7,
          head: [['Article', 'Stock Actuel', 'Seuil Min', 'Urgence']],
          body: stockFaibleData,
          theme: 'grid',
          headStyles: { 
            fillColor: [239, 68, 68],
            textColor: [255, 255, 255],
            fontSize: 11,
            fontStyle: 'bold',
            halign: 'center'
          },
          bodyStyles: {
            fontSize: 9
          },
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 35, halign: 'center', textColor: [239, 68, 68], fontStyle: 'bold' },
            2: { cellWidth: 35, halign: 'center', textColor: [100, 100, 100] },
            3: { cellWidth: 40, halign: 'center', fontSize: 8 }
          },
          margin: { left: 14, right: 14 }
        });
      }
      
      // Recommandations
      const finalY = doc.lastAutoTable.finalY + 20;
      if (finalY > pageHeight - 60) {
        doc.addPage();
        addHeader();
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(50, 50, 50);
        doc.text('💡 RECOMMANDATIONS', 14, 50);
      } else {
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(50, 50, 50);
        doc.text('💡 RECOMMANDATIONS', 14, finalY);
      }
      
      const recY = finalY > pageHeight - 60 ? 58 : finalY + 8;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(80, 80, 80);
      
      const recommendations = [
        `• Surveiller les ${stockFaible.length} articles en stock faible`,
        `• ${statutCounts.en_attente_prix} commande(s) en attente de prix`,
        `• ${statutCounts.en_attente_approbation} commande(s) en attente d'approbation`,
        '• Vérifier régulièrement les indicateurs de performance'
      ];
      
      recommendations.forEach((rec, index) => {
        doc.text(rec, 20, recY + (index * 7));
      });
      
      // Ajouter les pieds de page sur toutes les pages
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        addFooter(i);
      }
      
      // Sauvegarder avec nom professionnel
      const fileName = `Rapport-Gestion-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      toast.success('✅ Rapport PDF généré avec succès');
    } catch (error) {
      console.error('Erreur export PDF:', error);
      toast.error('❌ Erreur lors de la génération du rapport');
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


