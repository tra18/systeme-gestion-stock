import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter, TrendingUp, DollarSign } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';

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

  // Générer rapport PDF pour les commandes
  const generateCommandesPDF = () => {
    const doc = new jsPDF();
    
    // En-tête
    doc.setFontSize(20);
    doc.text('Rapport des Commandes', 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 14, 28);
    
    // Statistiques
    const total = commandes.length;
    const approuvees = commandes.filter(c => c.statut === 'approuve').length;
    const enAttente = commandes.filter(c => c.statut === 'en_attente').length;
    const montantTotal = commandes.reduce((sum, c) => sum + (c.prix || 0), 0);
    
    doc.setFontSize(12);
    doc.text('Vue d\'ensemble', 14, 38);
    doc.setFontSize(10);
    doc.text(`Total commandes: ${total}`, 14, 45);
    doc.text(`Approuvées: ${approuvees}`, 14, 52);
    doc.text(`En attente: ${enAttente}`, 14, 59);
    doc.text(`Montant total: ${new Intl.NumberFormat('fr-FR').format(montantTotal)} GNF`, 14, 66);
    
    // Tableau des commandes
    const tableData = commandes.slice(0, 50).map(cmd => [
      cmd.service || 'N/A',
      cmd.description?.substring(0, 40) || 'N/A',
      cmd.prix ? `${new Intl.NumberFormat('fr-FR').format(cmd.prix)} GNF` : 'N/A',
      cmd.statut || 'N/A',
      cmd.createdAt?.toDate?.()?.toLocaleDateString('fr-FR') || 'N/A'
    ]);
    
    doc.autoTable({
      head: [['Service', 'Description', 'Prix', 'Statut', 'Date']],
      body: tableData,
      startY: 75,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] }
    });
    
    // Sauvegarder
    doc.save(`rapport-commandes-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Rapport PDF généré avec succès !');
  };

  // Générer rapport PDF pour la maintenance
  const generateMaintenancePDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Rapport de Maintenance', 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 14, 28);
    
    // Statistiques
    const total = maintenances.length;
    const enCours = maintenances.filter(m => m.statut === 'en_cours').length;
    const terminees = maintenances.filter(m => m.statut === 'termine').length;
    const coutTotal = maintenances.reduce((sum, m) => sum + (m.coutEstime || 0), 0);
    
    doc.setFontSize(12);
    doc.text('Vue d\'ensemble', 14, 38);
    doc.setFontSize(10);
    doc.text(`Total maintenances: ${total}`, 14, 45);
    doc.text(`En cours: ${enCours}`, 14, 52);
    doc.text(`Terminées: ${terminees}`, 14, 59);
    doc.text(`Coût total: ${new Intl.NumberFormat('fr-FR').format(coutTotal)} GNF`, 14, 66);
    
    // Tableau
    const tableData = maintenances.slice(0, 50).map(m => [
      m.vehicule || 'N/A',
      m.type || 'N/A',
      m.prestataire || 'N/A',
      m.coutEstime ? `${new Intl.NumberFormat('fr-FR').format(m.coutEstime)} GNF` : 'N/A',
      m.statut || 'N/A'
    ]);
    
    doc.autoTable({
      head: [['Véhicule', 'Type', 'Prestataire', 'Coût', 'Statut']],
      body: tableData,
      startY: 75,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [249, 115, 22] }
    });
    
    doc.save(`rapport-maintenance-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Rapport PDF généré avec succès !');
  };

  // Générer rapport PDF RH
  const generateRHPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Rapport Ressources Humaines', 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 14, 28);
    
    // Statistiques RH
    const totalEmployes = employes.length;
    const actifs = employes.filter(e => e.statut === 'actif').length;
    const congesAttente = conges.filter(c => c.statut === 'en_attente').length;
    const masseSalariale = employes.filter(e => e.statut === 'actif').reduce((sum, e) => sum + (parseFloat(e.salaire) || 0), 0);
    
    doc.setFontSize(12);
    doc.text('Vue d\'ensemble', 14, 38);
    doc.setFontSize(10);
    doc.text(`Total employés: ${totalEmployes}`, 14, 45);
    doc.text(`Employés actifs: ${actifs}`, 14, 52);
    doc.text(`Congés en attente: ${congesAttente}`, 14, 59);
    doc.text(`Masse salariale: ${new Intl.NumberFormat('fr-FR').format(masseSalariale)} GNF`, 14, 66);
    
    // Tableau employés
    const tableData = employes.slice(0, 50).map(emp => [
      emp.nom || 'N/A',
      emp.poste || 'N/A',
      emp.departement || 'N/A',
      emp.salaire ? `${new Intl.NumberFormat('fr-FR').format(emp.salaire)} GNF` : 'N/A',
      emp.statut || 'N/A'
    ]);
    
    doc.autoTable({
      head: [['Nom', 'Poste', 'Département', 'Salaire', 'Statut']],
      body: tableData,
      startY: 75,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [34, 197, 94] }
    });
    
    doc.save(`rapport-rh-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Rapport PDF généré avec succès !');
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
    { value: 'stock', label: 'Stock & Inventaire', icon: FileText },
    { value: 'complet', label: 'Rapport Complet', icon: TrendingUp }
  ];

  const handleGeneratePDF = () => {
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
      default:
        toast.error('Type de rapport non pris en charge pour PDF');
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
                  {new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format(commandes.reduce((sum, c) => sum + (c.prix || 0), 0))} GNF
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
      </div>
    </div>
  );
};

export default RapportsManager;

