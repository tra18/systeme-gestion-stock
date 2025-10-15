import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  Laptop, 
  Smartphone, 
  Printer, 
  HardDrive, 
  Router, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Download
} from 'lucide-react';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ITAssetManager = ({ employes }) => {
  const { userProfile } = useAuth();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  const [formData, setFormData] = useState({
    nom: '',
    type: 'desktop', // desktop, laptop, smartphone, printer, server, network, other
    marque: '',
    modele: '',
    numeroSerie: '',
    numeroInventaire: '',
    dateAchat: '',
    garantie: '',
    cout: '',
    statut: 'actif', // actif, maintenance, hors_service, perdu, vole
    assigneA: '',
    emplacement: '',
    systemeExploitation: '',
    processeur: '',
    ram: '',
    stockage: '',
    ip: '',
    mac: '',
    notes: ''
  });

  const assetTypes = {
    desktop: { label: 'Ordinateur de bureau', icon: Monitor, color: 'blue' },
    laptop: { label: 'Ordinateur portable', icon: Laptop, color: 'green' },
    smartphone: { label: 'Smartphone', icon: Smartphone, color: 'purple' },
    printer: { label: 'Imprimante', icon: Printer, color: 'orange' },
    server: { label: 'Serveur', icon: HardDrive, color: 'red' },
    network: { label: 'Équipement réseau', icon: Router, color: 'teal' },
    other: { label: 'Autre', icon: Settings, color: 'gray' }
  };

  const statusConfig = {
    actif: { label: 'Actif', color: 'green', icon: CheckCircle },
    maintenance: { label: 'Maintenance', color: 'yellow', icon: AlertTriangle },
    hors_service: { label: 'Hors service', color: 'red', icon: XCircle },
    perdu: { label: 'Perdu', color: 'orange', icon: AlertTriangle },
    vole: { label: 'Volé', color: 'red', icon: XCircle }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      const assetsQuery = query(
        collection(db, 'it_assets'),
        orderBy('dateAchat', 'desc')
      );
      const snapshot = await getDocs(assetsQuery);
      
      const assetsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setAssets(assetsData);
    } catch (error) {
      console.error('Erreur lors du chargement des équipements:', error);
      toast.error('Erreur lors du chargement des équipements IT');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const assetData = {
        ...formData,
        cout: parseFloat(formData.cout) || 0,
        assigneNom: employes.find(emp => emp.id === formData.assigneA)?.nom || '',
        assignePrenom: employes.find(emp => emp.id === formData.assigneA)?.prenom || '',
        createdAt: new Date(),
        createdBy: userProfile?.uid || 'system',
        createdByName: userProfile?.nom || 'Système'
      };

      if (selectedAsset) {
        await updateDoc(doc(db, 'it_assets', selectedAsset.id), assetData);
        toast.success('Équipement modifié avec succès');
      } else {
        await addDoc(collection(db, 'it_assets'), assetData);
        toast.success('Équipement ajouté avec succès');
      }

      setShowCreateModal(false);
      setSelectedAsset(null);
      resetForm();
      loadAssets();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde de l\'équipement');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (asset) => {
    setSelectedAsset(asset);
    setFormData({
      nom: asset.nom || '',
      type: asset.type || 'desktop',
      marque: asset.marque || '',
      modele: asset.modele || '',
      numeroSerie: asset.numeroSerie || '',
      numeroInventaire: asset.numeroInventaire || '',
      dateAchat: asset.dateAchat || '',
      garantie: asset.garantie || '',
      cout: asset.cout || '',
      statut: asset.statut || 'actif',
      assigneA: asset.assigneA || '',
      emplacement: asset.emplacement || '',
      systemeExploitation: asset.systemeExploitation || '',
      processeur: asset.processeur || '',
      ram: asset.ram || '',
      stockage: asset.stockage || '',
      ip: asset.ip || '',
      mac: asset.mac || '',
      notes: asset.notes || ''
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (assetId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet équipement ?')) {
      try {
        await deleteDoc(doc(db, 'it_assets', assetId));
        toast.success('Équipement supprimé avec succès');
        loadAssets();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      type: 'desktop',
      marque: '',
      modele: '',
      numeroSerie: '',
      numeroInventaire: '',
      dateAchat: '',
      garantie: '',
      cout: '',
      statut: 'actif',
      assigneA: '',
      emplacement: '',
      systemeExploitation: '',
      processeur: '',
      ram: '',
      stockage: '',
      ip: '',
      mac: '',
      notes: ''
    });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(20, 184, 166);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('VITACH GUINÉE', 20, 20);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Inventaire du Parc Informatique', 20, 25);
    
    // Date
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 150, 25);
    
    // Table
    const tableData = assets.map(asset => {
      const typeInfo = assetTypes[asset.type];
      const statusInfo = statusConfig[asset.statut];
      const employe = employes.find(emp => emp.id === asset.assigneA);
      
      return [
        asset.numeroInventaire || 'N/A',
        asset.nom || 'N/A',
        typeInfo.label,
        asset.marque || 'N/A',
        asset.modele || 'N/A',
        employe ? `${employe.nom} ${employe.prenom}` : 'Non assigné',
        statusInfo.label,
        asset.dateAchat ? new Date(asset.dateAchat).toLocaleDateString('fr-FR') : 'N/A',
        asset.cout ? `${asset.cout} GNF` : 'N/A'
      ];
    });
    
    autoTable(doc, {
      startY: 40,
      head: [['N° Inventaire', 'Nom', 'Type', 'Marque', 'Modèle', 'Assigné à', 'Statut', 'Date Achat', 'Coût']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [20, 184, 166] },
      margin: { left: 20, right: 20 }
    });
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFillColor(20, 184, 166);
      doc.rect(0, doc.internal.pageSize.height - 15, 210, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text(`VITACH GUINÉE - Système de Gestion IT`, 20, doc.internal.pageSize.height - 8);
      doc.text(`Page ${i}/${pageCount}`, 180, doc.internal.pageSize.height - 8);
    }
    
    doc.save(`inventaire_parc_informatique_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('PDF généré avec succès');
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = !searchTerm || 
      asset.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.numeroInventaire?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.marque?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.modele?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filterStatus || asset.statut === filterStatus;
    const matchesType = !filterType || asset.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: assets.length,
    actif: assets.filter(a => a.statut === 'actif').length,
    maintenance: assets.filter(a => a.statut === 'maintenance').length,
    horsService: assets.filter(a => a.statut === 'hors_service').length,
    valeur: assets.reduce((sum, a) => sum + (parseFloat(a.cout) || 0), 0)
  };

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
          <h2 className="text-2xl font-bold text-gray-900">Gestion du Parc Informatique</h2>
          <p className="text-gray-600">Inventaire et suivi des équipements IT</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={generatePDF}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Ajouter Équipement
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Monitor className="h-8 w-8 text-teal-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Actifs</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.actif}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Maintenance</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.maintenance}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Hors Service</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.horsService}</dd>
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
                <dt className="text-sm font-medium text-gray-500 truncate">Valeur Totale</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {new Intl.NumberFormat('fr-FR').format(stats.valeur)} GNF
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher un équipement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(statusConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="">Tous les types</option>
            {Object.entries(assetTypes).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Liste des équipements */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Équipement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigné à
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Achat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssets.map((asset) => {
                const typeInfo = assetTypes[asset.type];
                const statusInfo = statusConfig[asset.statut];
                const TypeIcon = typeInfo.icon;
                const StatusIcon = statusInfo.icon;
                const employe = employes.find(emp => emp.id === asset.assigneA);
                
                return (
                  <tr key={asset.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className={`h-10 w-10 rounded-full bg-${typeInfo.color}-100 flex items-center justify-center`}>
                            <TypeIcon className={`h-5 w-5 text-${typeInfo.color}-600`} />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {asset.nom || 'Sans nom'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {asset.numeroInventaire && `#${asset.numeroInventaire}`}
                            {asset.marque && asset.modele && ` • ${asset.marque} ${asset.modele}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${typeInfo.color}-100 text-${typeInfo.color}-800`}>
                        {typeInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {employe ? `${employe.nom} ${employe.prenom}` : 'Non assigné'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${statusInfo.color}-100 text-${statusInfo.color}-800`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {asset.dateAchat ? new Date(asset.dateAchat).toLocaleDateString('fr-FR') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(asset)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(asset.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de création/édition */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedAsset ? 'Modifier l\'équipement' : 'Nouvel équipement IT'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedAsset(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informations générales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nom de l'équipement *
                    </label>
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                      required
                    >
                      {Object.entries(assetTypes).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Statut *
                    </label>
                    <select
                      value={formData.statut}
                      onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                      required
                    >
                      {Object.entries(statusConfig).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Informations techniques */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Marque
                    </label>
                    <input
                      type="text"
                      value={formData.marque}
                      onChange={(e) => setFormData({ ...formData, marque: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Modèle
                    </label>
                    <input
                      type="text"
                      value={formData.modele}
                      onChange={(e) => setFormData({ ...formData, modele: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Numéro de série
                    </label>
                    <input
                      type="text"
                      value={formData.numeroSerie}
                      onChange={(e) => setFormData({ ...formData, numeroSerie: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>

                {/* Informations administratives */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      N° Inventaire
                    </label>
                    <input
                      type="text"
                      value={formData.numeroInventaire}
                      onChange={(e) => setFormData({ ...formData, numeroInventaire: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Date d'achat
                    </label>
                    <input
                      type="date"
                      value={formData.dateAchat}
                      onChange={(e) => setFormData({ ...formData, dateAchat: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Garantie (mois)
                    </label>
                    <input
                      type="number"
                      value={formData.garantie}
                      onChange={(e) => setFormData({ ...formData, garantie: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Coût (GNF)
                    </label>
                    <input
                      type="number"
                      value={formData.cout}
                      onChange={(e) => setFormData({ ...formData, cout: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>

                {/* Assignation et localisation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Assigné à
                    </label>
                    <select
                      value={formData.assigneA}
                      onChange={(e) => setFormData({ ...formData, assigneA: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="">Non assigné</option>
                      {employes.map((employe) => (
                        <option key={employe.id} value={employe.id}>
                          {employe.nom} {employe.prenom} - {employe.poste}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Emplacement
                    </label>
                    <input
                      type="text"
                      value={formData.emplacement}
                      onChange={(e) => setFormData({ ...formData, emplacement: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                      placeholder="ex: Bureau DG, Service IT, etc."
                    />
                  </div>
                </div>

                {/* Spécifications techniques */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Système d'exploitation
                    </label>
                    <input
                      type="text"
                      value={formData.systemeExploitation}
                      onChange={(e) => setFormData({ ...formData, systemeExploitation: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Processeur
                    </label>
                    <input
                      type="text"
                      value={formData.processeur}
                      onChange={(e) => setFormData({ ...formData, processeur: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      RAM
                    </label>
                    <input
                      type="text"
                      value={formData.ram}
                      onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                      placeholder="ex: 8GB DDR4"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Stockage
                    </label>
                    <input
                      type="text"
                      value={formData.stockage}
                      onChange={(e) => setFormData({ ...formData, stockage: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                      placeholder="ex: 256GB SSD"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Adresse IP
                    </label>
                    <input
                      type="text"
                      value={formData.ip}
                      onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                      placeholder="ex: 192.168.1.100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Adresse MAC
                  </label>
                  <input
                    type="text"
                    value={formData.mac}
                    onChange={(e) => setFormData({ ...formData, mac: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    placeholder="ex: 00:1B:44:11:3A:B7"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Notes supplémentaires sur l'équipement..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setSelectedAsset(null);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700 disabled:opacity-50 flex items-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Settings className="h-4 w-4 mr-2" />
                        Enregistrer
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ITAssetManager;
