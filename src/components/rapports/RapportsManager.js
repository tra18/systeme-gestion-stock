import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter, TrendingUp, DollarSign } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';
import PayrollManager from './PayrollManager';

const RapportsManager = ({ 
  commandes = [], 
  maintenances = [], 
  employes = [], 
  stock = [],
  salaires = [],
  conges = []
}) => {
  const [typeRapport, setTypeRapport] = useState('commandes');
  const [periode, setPeriode] = useState('mois');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  // Fonction utilitaire pour formater les prix
  const formatPrice = (price) => {
    if (!price && price !== 0) return 'N/A';
    
    // Convertir en chaîne et nettoyer
    let cleanPrice = String(price).trim();
    
    // Gérer les cas spéciaux de formatage
    if (cleanPrice.includes('/')) {
      // Remplacer les barres obliques par des espaces (séparateurs de milliers)
      cleanPrice = cleanPrice.replace(/\//g, '');
    }
    
    // Enlever tous les caractères non numériques sauf points et virgules
    cleanPrice = cleanPrice.replace(/[^\d.,]/g, '');
    
    // Remplacer les virgules par des points pour le parsing décimal
    cleanPrice = cleanPrice.replace(',', '.');
    
    // Convertir en nombre
    const numPrice = parseFloat(cleanPrice);
    
    // Vérifier si c'est un nombre valide
    if (isNaN(numPrice)) return 'N/A';
    
    // Formater avec Intl.NumberFormat (espaces comme séparateurs de milliers)
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numPrice) + ' GNF';
  };


  // Générer rapport PDF pour les commandes
  const generateCommandesPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Filtrer les commandes par période
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let commandesFiltrees = commandes;
      if (periode === 'aujourd_hui') {
        commandesFiltrees = commandes.filter(c => {
          const dateCommande = c.createdAt?.toDate?.() || new Date(c.createdAt);
          dateCommande.setHours(0, 0, 0, 0);
          return dateCommande.getTime() === today.getTime();
        });
      } else if (periode === 'semaine') {
        const semaineDebut = new Date(today);
        semaineDebut.setDate(today.getDate() - 7);
        commandesFiltrees = commandes.filter(c => {
          const dateCommande = c.createdAt?.toDate?.() || new Date(c.createdAt);
          return dateCommande >= semaineDebut;
        });
      } else if (periode === 'mois') {
        const moisDebut = new Date(today);
        moisDebut.setMonth(today.getMonth() - 1);
        commandesFiltrees = commandes.filter(c => {
          const dateCommande = c.createdAt?.toDate?.() || new Date(c.createdAt);
          return dateCommande >= moisDebut;
        });
      }
      
      // En-tête avec logo
      doc.setFillColor(20, 184, 166); // Teal background
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255); // White text
      doc.setFontSize(16);
      doc.text('VITACH GUINÉE', 20, 15);
      
      doc.setFontSize(12);
      doc.text('Rapport des Commandes', 20, 25);
      
      doc.setFontSize(8);
      doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}`, 20, 35);
      
      // Statistiques avec données filtrées
      const total = commandesFiltrees.length;
      const approuvees = commandesFiltrees.filter(c => c.statut === 'approuve').length;
      const enAttente = commandesFiltrees.filter(c => c.statut === 'en_attente').length;
      const rejetees = commandesFiltrees.filter(c => c.statut === 'rejete').length;
      const montantTotal = commandesFiltrees.reduce((sum, c) => {
        if (!c.prix) return sum;
        let cleanPrice = String(c.prix).trim();
        if (cleanPrice.includes('/')) {
          cleanPrice = cleanPrice.replace(/\//g, '');
        }
        const price = parseFloat(cleanPrice.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
        return sum + price;
      }, 0);
      
      doc.setTextColor(0, 0, 0); // Black text
      doc.setFontSize(12);
      doc.text('Vue d\'ensemble', 20, 50);
      
      doc.setFontSize(10);
      doc.text(`Période: ${periode === 'aujourd_hui' ? 'Aujourd\'hui' : periode === 'semaine' ? '7 derniers jours' : periode === 'mois' ? '30 derniers jours' : 'Toutes'}`, 20, 58);
      doc.text(`Total commandes: ${total}`, 20, 65);
      doc.text(`Approuvées: ${approuvees} (${total > 0 ? Math.round((approuvees/total)*100) : 0}%)`, 20, 72);
      doc.text(`En attente: ${enAttente} (${total > 0 ? Math.round((enAttente/total)*100) : 0}%)`, 20, 79);
      doc.text(`Rejetées: ${rejetees} (${total > 0 ? Math.round((rejetees/total)*100) : 0}%)`, 20, 86);
      doc.text(`Montant total: ${formatPrice(montantTotal)}`, 20, 93);
      
      // Tableau des commandes filtrées
      const tableData = commandesFiltrees.slice(0, 50).map(cmd => [
        cmd.service || 'N/A',
        cmd.description?.substring(0, 40) || 'N/A',
        formatPrice(cmd.prix),
        cmd.statut || 'N/A',
        cmd.createdAt?.toDate?.()?.toLocaleDateString('fr-FR') || new Date(cmd.createdAt).toLocaleDateString('fr-FR') || 'N/A'
      ]);
      
      autoTable(doc, {
        head: [['Service', 'Description', 'Prix', 'Statut', 'Date']],
        body: tableData,
        startY: 105,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [20, 184, 166] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 20, right: 20 }
      });
      
      // Pied de page
      const pageHeight = doc.internal.pageSize.height;
      doc.setFillColor(20, 184, 166);
      doc.rect(0, pageHeight - 20, 210, 20, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text('VITACH GUINÉE - Système de Gestion Intégré', 20, pageHeight - 8);
      doc.text(`Page 1 - ${total} commandes`, 160, pageHeight - 8);
      
      // Sauvegarder
      const fileName = `rapport-commandes-${periode}-${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Essayer de sauvegarder le PDF
      try {
        doc.save(fileName);
        toast.success('Rapport PDF généré avec succès !');
      } catch (saveError) {
        console.error('Erreur lors de la sauvegarde:', saveError);
        // Alternative: créer un blob et télécharger
        const pdfBlob = doc.output('blob');
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Rapport PDF généré avec succès !');
      }
    } catch (error) {
      console.error('Erreur lors de la génération du PDF des commandes:', error);
      toast.error('Erreur lors de la génération du PDF des commandes');
    }
  };

  // Générer rapport PDF pour la maintenance
  const generateMaintenancePDF = () => {
    try {
      const doc = new jsPDF();
      
      // En-tête avec logo
      doc.setFillColor(20, 184, 166); // Teal background
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255); // White text
      doc.setFontSize(16);
      doc.text('VITACH GUINÉE', 20, 15);
      
      doc.setFontSize(12);
      doc.text('Rapport de Maintenance', 20, 25);
      
      doc.setFontSize(8);
      doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}`, 20, 35);
      
      // Statistiques
      const total = maintenances.length;
      const enCours = maintenances.filter(m => m.statut === 'en_cours').length;
      const terminees = maintenances.filter(m => m.statut === 'termine').length;
      const enAttente = maintenances.filter(m => m.statut === 'en_attente').length;
      const coutTotal = maintenances.reduce((sum, m) => {
        if (!m.coutEstime) return sum;
        let cleanPrice = String(m.coutEstime).trim();
        if (cleanPrice.includes('/')) {
          cleanPrice = cleanPrice.replace(/\//g, '');
        }
        const price = parseFloat(cleanPrice.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
        return sum + price;
      }, 0);
      
      doc.setTextColor(0, 0, 0); // Black text
      doc.setFontSize(12);
      doc.text('Vue d\'ensemble', 20, 50);
      
      doc.setFontSize(10);
      doc.text(`Total maintenances: ${total}`, 20, 58);
      doc.text(`En cours: ${enCours} (${total > 0 ? Math.round((enCours/total)*100) : 0}%)`, 20, 65);
      doc.text(`Terminées: ${terminees} (${total > 0 ? Math.round((terminees/total)*100) : 0}%)`, 20, 72);
      doc.text(`En attente: ${enAttente} (${total > 0 ? Math.round((enAttente/total)*100) : 0}%)`, 20, 79);
      doc.text(`Coût total: ${formatPrice(coutTotal)}`, 20, 86);
      
      // Tableau
      const tableData = maintenances.slice(0, 50).map(m => [
        m.vehicule || 'N/A',
        m.type || 'N/A',
        m.prestataire || 'N/A',
        formatPrice(m.coutEstime),
        m.statut || 'N/A'
      ]);
      
      autoTable(doc, {
        head: [['Véhicule', 'Type', 'Prestataire', 'Coût', 'Statut']],
        body: tableData,
        startY: 98,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [20, 184, 166] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 20, right: 20 }
      });
      
      // Pied de page
      const pageHeight = doc.internal.pageSize.height;
      doc.setFillColor(20, 184, 166);
      doc.rect(0, pageHeight - 20, 210, 20, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text('VITACH GUINÉE - Système de Gestion Intégré', 20, pageHeight - 8);
      doc.text(`Page 1 - ${total} maintenances`, 160, pageHeight - 8);
      
      const fileName = `rapport-maintenance-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      toast.success('Rapport PDF généré avec succès !');
    } catch (error) {
      console.error('Erreur lors de la génération du PDF de maintenance:', error);
      toast.error('Erreur lors de la génération du PDF de maintenance');
    }
  };

  // Générer rapport PDF RH
  const generateRHPDF = () => {
    try {
      const doc = new jsPDF();
      
      // En-tête avec logo
      doc.setFillColor(20, 184, 166); // Teal background
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255); // White text
      doc.setFontSize(16);
      doc.text('VITACH GUINÉE', 20, 15);
      
      doc.setFontSize(12);
      doc.text('Rapport Ressources Humaines', 20, 25);
      
      doc.setFontSize(8);
      doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}`, 20, 35);
      
      // Statistiques RH
      const totalEmployes = employes.length;
      const actifs = employes.filter(e => e.statut === 'actif').length;
      const inactifs = employes.filter(e => e.statut === 'inactif').length;
      const congesAttente = conges.filter(c => c.statut === 'en_attente').length;
      const congesApprouves = conges.filter(c => c.statut === 'approuve').length;
      const masseSalariale = employes.filter(e => e.statut === 'actif').reduce((sum, e) => {
        if (!e.salaire) return sum;
        let cleanPrice = String(e.salaire).trim();
        if (cleanPrice.includes('/')) {
          cleanPrice = cleanPrice.replace(/\//g, '');
        }
        const price = parseFloat(cleanPrice.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
        return sum + price;
      }, 0);
      
      doc.setTextColor(0, 0, 0); // Black text
      doc.setFontSize(12);
      doc.text('Vue d\'ensemble', 20, 50);
      
      doc.setFontSize(10);
      doc.text(`Total employés: ${totalEmployes}`, 20, 58);
      doc.text(`Employés actifs: ${actifs} (${totalEmployes > 0 ? Math.round((actifs/totalEmployes)*100) : 0}%)`, 20, 65);
      doc.text(`Employés inactifs: ${inactifs} (${totalEmployes > 0 ? Math.round((inactifs/totalEmployes)*100) : 0}%)`, 20, 72);
      doc.text(`Congés en attente: ${congesAttente}`, 20, 79);
      doc.text(`Congés approuvés: ${congesApprouves}`, 20, 86);
      doc.text(`Masse salariale mensuelle: ${formatPrice(masseSalariale)}`, 20, 93);
    
      // Tableau employés
      const tableData = employes.slice(0, 50).map(emp => [
        `${emp.nom || 'N/A'} ${emp.prenom || ''}`.trim(),
        emp.poste || 'N/A',
        emp.service || emp.departement || 'N/A',
        formatPrice(emp.salaire),
        emp.statut || 'N/A'
      ]);
      
      autoTable(doc, {
        head: [['Nom Complet', 'Poste', 'Service', 'Salaire', 'Statut']],
        body: tableData,
        startY: 105,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [20, 184, 166] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 20, right: 20 }
      });
      
      // Pied de page
      const pageHeight = doc.internal.pageSize.height;
      doc.setFillColor(20, 184, 166);
      doc.rect(0, pageHeight - 20, 210, 20, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text('VITACH GUINÉE - Système de Gestion Intégré', 20, pageHeight - 8);
      doc.text(`Page 1 - ${totalEmployes} employés`, 160, pageHeight - 8);
      
      const fileName = `rapport-rh-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      toast.success('Rapport PDF généré avec succès !');
    } catch (error) {
      console.error('Erreur lors de la génération du PDF RH:', error);
      toast.error('Erreur lors de la génération du PDF RH');
    }
  };

  // Générer Excel pour les commandes
  const generateCommandesExcel = () => {
    const data = commandes.map(cmd => ({
      'Service': cmd.service || '',
      'Description': cmd.description || '',
      'Quantité': cmd.quantite || '',
      'Unité': cmd.unite || '',
      'Prix (GNF)': cmd.prix || 0,
      'Fournisseur': cmd.fournisseur || '',
      'Statut': cmd.statut || '',
      'Demandeur': cmd.createdByName || '',
      'Date': cmd.createdAt?.toDate?.()?.toLocaleDateString('fr-FR') || ''
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Commandes');
    
    // Ajouter des statistiques
    const stats = [
      ['Statistiques'],
      ['Total commandes', commandes.length],
      ['Approuvées', commandes.filter(c => c.statut === 'approuve').length],
      ['En attente', commandes.filter(c => c.statut === 'en_attente').length],
      ['Montant total (GNF)', commandes.reduce((sum, c) => sum + (c.prix || 0), 0)]
    ];
    
    const ws2 = XLSX.utils.aoa_to_sheet(stats);
    XLSX.utils.book_append_sheet(wb, ws2, 'Statistiques');
    
    XLSX.writeFile(wb, `rapport-commandes-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Rapport Excel généré avec succès !');
  };

  // Générer Excel pour RH
  const generateRHExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Feuille Employés
    const employesData = employes.map(emp => ({
      'Nom': emp.nom || '',
      'Poste': emp.poste || '',
      'Département': emp.departement || '',
      'Salaire (GNF)': emp.salaire || 0,
      'Email': emp.email || '',
      'Téléphone': emp.telephone || '',
      'Statut': emp.statut || '',
      'Date d\'embauche': emp.dateEmbauche?.toDate?.()?.toLocaleDateString('fr-FR') || ''
    }));
    const ws1 = XLSX.utils.json_to_sheet(employesData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Employés');
    
    // Feuille Congés
    const congesData = conges.map(c => ({
      'Employé': employes.find(e => e.id === c.employeId)?.nom || 'N/A',
      'Type': c.type || '',
      'Date début': c.dateDebut?.toDate?.()?.toLocaleDateString('fr-FR') || '',
      'Date fin': c.dateFin?.toDate?.()?.toLocaleDateString('fr-FR') || '',
      'Durée (jours)': c.duree || 0,
      'Statut': c.statut || '',
      'Motif': c.motif || ''
    }));
    const ws2 = XLSX.utils.json_to_sheet(congesData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Congés');
    
    // Feuille Salaires
    if (salaires.length > 0) {
      const salairesData = salaires.map(s => ({
        'Employé': employes.find(e => e.id === s.employeId)?.nom || 'N/A',
        'Mois': s.mois || '',
        'Salaire base (GNF)': s.salaireBase || 0,
        'Primes (GNF)': s.primes || 0,
        'Déductions (GNF)': s.deductions || 0,
        'Salaire net (GNF)': s.salaireNet || 0,
        'Méthode paiement': s.methodePaiement || ''
      }));
      const ws3 = XLSX.utils.json_to_sheet(salairesData);
      XLSX.utils.book_append_sheet(wb, ws3, 'Salaires');
    }
    
    XLSX.writeFile(wb, `rapport-rh-complet-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Rapport Excel RH généré avec succès !');
  };

  // Générer Excel pour le stock
  const generateStockExcel = () => {
    const data = stock.map(item => ({
      'Article': item.designation || item.nom || '',
      'Référence': item.reference || '',
      'Catégorie': item.categorie || '',
      'Quantité': item.quantite || 0,
      'Unité': item.unite || '',
      'Seuil alerte': item.seuilAlerte || 0,
      'Emplacement': item.emplacement || '',
      'Valeur unitaire (GNF)': item.prixUnitaire || 0,
      'Valeur totale (GNF)': (item.quantite || 0) * (item.prixUnitaire || 0)
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventaire');
    
    // Statistiques
    const stats = [
      ['Statistiques Stock'],
      ['Total articles', stock.length],
      ['Articles en stock faible', stock.filter(s => s.quantite < (s.seuilAlerte || 10)).length],
      ['Valeur totale stock (GNF)', stock.reduce((sum, s) => sum + ((s.quantite || 0) * (s.prixUnitaire || 0)), 0)]
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(stats);
    XLSX.utils.book_append_sheet(wb, ws2, 'Statistiques');
    
    XLSX.writeFile(wb, `inventaire-stock-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Inventaire Excel généré avec succès !');
  };

  // Générer rapport complet (tous les modules)
  const generateRapportComplet = () => {
    const wb = XLSX.utils.book_new();
    
    // Commandes
    if (commandes.length > 0) {
      const commandesData = commandes.map(c => ({
        'Service': c.service,
        'Description': c.description,
        'Prix': c.prix,
        'Statut': c.statut,
        'Date': c.createdAt?.toDate?.()?.toLocaleDateString('fr-FR')
      }));
      const ws1 = XLSX.utils.json_to_sheet(commandesData);
      XLSX.utils.book_append_sheet(wb, ws1, 'Commandes');
    }
    
    // Maintenance
    if (maintenances.length > 0) {
      const maintenanceData = maintenances.map(m => ({
        'Véhicule': m.vehicule,
        'Type': m.type,
        'Coût': m.coutEstime,
        'Statut': m.statut
      }));
      const ws2 = XLSX.utils.json_to_sheet(maintenanceData);
      XLSX.utils.book_append_sheet(wb, ws2, 'Maintenance');
    }
    
    // Employés
    if (employes.length > 0) {
      const employesData = employes.map(e => ({
        'Nom': e.nom,
        'Poste': e.poste,
        'Département': e.departement,
        'Salaire': e.salaire,
        'Statut': e.statut
      }));
      const ws3 = XLSX.utils.json_to_sheet(employesData);
      XLSX.utils.book_append_sheet(wb, ws3, 'Employés');
    }
    
    // Stock
    if (stock.length > 0) {
      const stockData = stock.map(s => ({
        'Article': s.designation || s.nom,
        'Quantité': s.quantite,
        'Seuil alerte': s.seuilAlerte
      }));
      const ws4 = XLSX.utils.json_to_sheet(stockData);
      XLSX.utils.book_append_sheet(wb, ws4, 'Stock');
    }
    
    XLSX.writeFile(wb, `rapport-complet-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Rapport complet généré avec succès !');
  };

  const typesRapports = [
    { value: 'commandes', label: 'Commandes', icon: FileText },
    { value: 'maintenance', label: 'Maintenance', icon: FileText },
    { value: 'rh', label: 'Ressources Humaines', icon: FileText },
    { value: 'paie', label: '💰 Paie', icon: FileText },
    { value: 'stock', label: 'Stock & Inventaire', icon: FileText },
    { value: 'complet', label: 'Rapport Complet', icon: TrendingUp }
  ];

  const handleGeneratePDF = () => {
    try {
      switch(typeRapport) {
        case 'commandes':
          generateCommandesPDF();
          break;
        case 'maintenance':
          generateMaintenancePDF();
          break;
        case 'rh':
          generateRHPDF();
          break;
        case 'paie':
          // La paie est gérée par le composant PayrollManager
          toast.info('Utilisez les boutons de la section Paie ci-dessous');
          break;
        default:
          toast.error('Type de rapport non pris en charge pour PDF');
      }
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    }
  };

  const handleGenerateExcel = () => {
    switch(typeRapport) {
      case 'commandes':
        generateCommandesExcel();
        break;
      case 'rh':
        generateRHExcel();
        break;
      case 'paie':
        // La paie est gérée par le composant PayrollManager
        toast.info('Utilisez les boutons de la section Paie ci-dessous');
        break;
      case 'stock':
        generateStockExcel();
        break;
      case 'complet':
        generateRapportComplet();
        break;
      default:
        toast.error('Type de rapport non pris en charge pour Excel');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📊 Génération de Rapports</h2>
          <p className="text-gray-600">Exportez vos données en PDF ou Excel</p>
        </div>
        <FileText className="text-blue-600" size={32} />
      </div>

      <div className="space-y-6">
        {/* Sélection du type de rapport */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Type de rapport
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {typesRapports.map(type => (
              <button
                key={type.value}
                onClick={() => setTypeRapport(type.value)}
                className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-all ${
                  typeRapport === type.value
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <type.icon size={20} />
                <span className="text-sm font-medium">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Statistiques du rapport sélectionné */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          {typeRapport === 'commandes' && (
            <>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{commandes.length}</p>
                <p className="text-xs text-gray-600">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{commandes.filter(c => c.statut === 'approuve').length}</p>
                <p className="text-xs text-gray-600">Approuvées</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{commandes.filter(c => c.statut === 'en_attente').length}</p>
                <p className="text-xs text-gray-600">En attente</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format(commandes.reduce((sum, c) => {
                    if (!c.prix) return sum;
                    let cleanPrice = String(c.prix).trim();
                    if (cleanPrice.includes('/')) {
                      cleanPrice = cleanPrice.replace(/\//g, '');
                    }
                    const price = parseFloat(cleanPrice.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
                    return sum + price;
                  }, 0))} GNF
                </p>
                <p className="text-xs text-gray-600">Montant total</p>
              </div>
            </>
          )}
          
          {typeRapport === 'rh' && (
            <>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{employes.length}</p>
                <p className="text-xs text-gray-600">Employés</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{employes.filter(e => e.statut === 'actif').length}</p>
                <p className="text-xs text-gray-600">Actifs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{conges.filter(c => c.statut === 'en_attente').length}</p>
                <p className="text-xs text-gray-600">Congés attente</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format(
                    employes.filter(e => e.statut === 'actif').reduce((sum, e) => sum + (parseFloat(e.salaire) || 0), 0)
                  )} GNF
                </p>
                <p className="text-xs text-gray-600">Masse salariale</p>
              </div>
            </>
          )}

          {typeRapport === 'maintenance' && (
            <>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{maintenances.length}</p>
                <p className="text-xs text-gray-600">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{maintenances.filter(m => m.statut === 'en_cours').length}</p>
                <p className="text-xs text-gray-600">En cours</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{maintenances.filter(m => m.statut === 'termine').length}</p>
                <p className="text-xs text-gray-600">Terminées</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format(
                    maintenances.reduce((sum, m) => sum + (m.coutEstime || 0), 0)
                  )} GNF
                </p>
                <p className="text-xs text-gray-600">Coût total</p>
              </div>
            </>
          )}

          {typeRapport === 'stock' && (
            <>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stock.length}</p>
                <p className="text-xs text-gray-600">Articles</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{stock.filter(s => s.quantite < (s.seuilAlerte || 10)).length}</p>
                <p className="text-xs text-gray-600">Stock faible</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stock.reduce((sum, s) => sum + (s.quantite || 0), 0)}</p>
                <p className="text-xs text-gray-600">Quantité totale</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format(
                    stock.reduce((sum, s) => sum + ((s.quantite || 0) * (s.prixUnitaire || 0)), 0)
                  )} GNF
                </p>
                <p className="text-xs text-gray-600">Valeur stock</p>
              </div>
            </>
          )}
        </div>

        {/* Boutons d'export */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleGeneratePDF}
            disabled={typeRapport === 'complet' || typeRapport === 'stock'}
            className="flex-1 flex items-center justify-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={20} />
            <span className="font-medium">Télécharger PDF</span>
          </button>
          
          <button
            onClick={handleGenerateExcel}
            className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
          >
            <Download size={20} />
            <span className="font-medium">Télécharger Excel</span>
          </button>
        </div>

        {/* Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            💡 <strong>Astuce :</strong> Les rapports Excel contiennent plusieurs feuilles avec statistiques détaillées. 
            Les rapports PDF sont optimisés pour l'impression.
          </p>
        </div>

        {/* Section Paie */}
        {typeRapport === 'paie' && (
          <div className="mt-6">
            <PayrollManager employes={employes} />
          </div>
        )}
      </div>
    </div>
  );
};

export default RapportsManager;

