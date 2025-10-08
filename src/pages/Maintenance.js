import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Car,
  X
} from 'lucide-react';
import { collection, query, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Maintenance = () => {
  const { userProfile } = useAuth();
  const [maintenances, setMaintenances] = useState([]);
  const [vehicules, setVehicules] = useState([]);
  const [prestataires, setPrestataires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('tous');
  const [vehiculeFilter, setVehiculeFilter] = useState('tous');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [showVehiculeModal, setShowVehiculeModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [maintenancesSnapshot, vehiculesSnapshot, prestatairesSnapshot] = await Promise.all([
        getDocs(collection(db, 'maintenance')),
        getDocs(query(collection(db, 'vehicules'))),
        getDocs(query(collection(db, 'prestataires')))
      ]);

      const maintenancesData = maintenancesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const vehiculesData = vehiculesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const prestatairesData = prestatairesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Enrichir les maintenances avec les données des véhicules et prestataires
      const enrichedMaintenances = maintenancesData.map(maintenance => ({
        ...maintenance,
        vehicule: vehiculesData.find(v => v.id === maintenance.vehiculeId),
        prestataire: prestatairesData.find(p => p.id === maintenance.prestataireId)
      }));

      setMaintenances(enrichedMaintenances);
      setVehicules(vehiculesData);
      setPrestataires(prestatairesData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les maintenances
  const filteredMaintenances = maintenances.filter(maintenance => {
    const matchesSearch = maintenance.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         maintenance.vehicule?.marque?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         maintenance.vehicule?.modele?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'tous' || maintenance.statut === statusFilter;
    const matchesVehicule = vehiculeFilter === 'tous' || maintenance.vehiculeId === vehiculeFilter;
    
    return matchesSearch && matchesStatus && matchesVehicule;
  });

  // Composant Modal pour créer/modifier une maintenance
  const MaintenanceModal = ({ onClose, onSave, maintenance = null }) => {
    const [formData, setFormData] = useState({
      vehiculeId: maintenance?.vehiculeId || '',
      type: maintenance?.type || 'Entretien périodique',
      description: maintenance?.description || '',
      prestataireId: maintenance?.prestataireId || '',
      dateEntretien: maintenance?.dateEntretien?.toDate?.()?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      coutEstime: maintenance?.coutEstime || '',
      statut: maintenance?.statut || 'planifiee',
      notes: maintenance?.notes || ''
    });

    const typesMaintenance = [
      'Entretien périodique',
      'Vidange',
      'Révision complète',
      'Réparation',
      'Changement de pneus',
      'Contrôle technique',
      'Autre'
    ];

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      try {
        const maintenanceData = {
          ...formData,
          dateEntretien: new Date(formData.dateEntretien),
          coutEstime: parseFloat(formData.coutEstime) || 0,
          createdAt: maintenance ? maintenance.createdAt : new Date(),
          updatedAt: new Date(),
          createdBy: userProfile?.uid || 'system',
          createdByName: userProfile?.nom || 'Système'
        };

        if (maintenance) {
          await updateDoc(doc(db, 'maintenance', maintenance.id), maintenanceData);
          toast.success('Maintenance modifiée avec succès');
        } else {
          await addDoc(collection(db, 'maintenance'), maintenanceData);
          toast.success('Maintenance créée avec succès');
        }

        onSave();
        onClose();
      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Erreur lors de l\'enregistrement');
      }
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
          <div className="mt-3">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {maintenance ? 'Modifier' : 'Nouvelle'} Maintenance
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Véhicule *
                  </label>
                  <select
                    required
                    value={formData.vehiculeId}
                    onChange={(e) => setFormData({...formData, vehiculeId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner un véhicule</option>
                    {vehicules.filter(v => v.statut !== 'supprime').map(v => (
                      <option key={v.id} value={v.id}>
                        {v.marque} {v.modele} - {v.immatriculation}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de maintenance *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {typesMaintenance.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Détails de la maintenance..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prestataire *
                  </label>
                  <select
                    required
                    value={formData.prestataireId}
                    onChange={(e) => setFormData({...formData, prestataireId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner un prestataire</option>
                    {prestataires.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date d'entretien *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dateEntretien}
                    onChange={(e) => setFormData({...formData, dateEntretien: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coût estimé (GNF)
                  </label>
                  <input
                    type="number"
                    value={formData.coutEstime}
                    onChange={(e) => setFormData({...formData, coutEstime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    value={formData.statut}
                    onChange={(e) => setFormData({...formData, statut: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="planifiee">Planifiée</option>
                    <option value="en_cours">En cours</option>
                    <option value="terminee">Terminée</option>
                    <option value="annulee">Annulée</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes additionnelles
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Notes optionnelles..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  {maintenance ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Composant Modal pour gérer les véhicules
  const VehiculeModal = ({ vehicules, onClose, onSave }) => {
    const [formData, setFormData] = useState({
      marque: '',
      modele: '',
      immatriculation: '',
      annee: '',
      kilometrage: '',
      type: 'voiture',
      statut: 'actif'
    });
    const [loading, setLoading] = useState(false);
    const [editingVehicule, setEditingVehicule] = useState(null);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      try {
        if (editingVehicule) {
          await updateDoc(doc(db, 'vehicules', editingVehicule.id), {
            ...formData,
            updatedAt: new Date()
          });
          toast.success('Véhicule mis à jour avec succès');
        } else {
          await addDoc(collection(db, 'vehicules'), {
            ...formData,
            createdAt: new Date()
          });
          toast.success('Véhicule créé avec succès');
        }
        
        onSave();
        onClose();
        setFormData({
          marque: '',
          modele: '',
          immatriculation: '',
          annee: '',
          kilometrage: '',
          type: 'voiture',
          statut: 'actif'
        });
        setEditingVehicule(null);
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        toast.error('Erreur lors de la sauvegarde');
      } finally {
        setLoading(false);
      }
    };

    const handleEdit = (vehicule) => {
      setEditingVehicule(vehicule);
      setFormData({
        marque: vehicule.marque || '',
        modele: vehicule.modele || '',
        immatriculation: vehicule.immatriculation || '',
        annee: vehicule.annee || '',
        kilometrage: vehicule.kilometrage || '',
        type: vehicule.type || 'voiture',
        statut: vehicule.statut || 'actif'
      });
    };

    const handleDelete = async (vehiculeId) => {
      if (window.confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
        try {
          await updateDoc(doc(db, 'vehicules', vehiculeId), {
            statut: 'supprime',
            deletedAt: new Date()
          });
          toast.success('Véhicule supprimé avec succès');
          onSave();
        } catch (error) {
          console.error('Erreur lors de la suppression:', error);
          toast.error('Erreur lors de la suppression');
        }
      }
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
          <div className="mt-3">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Gestion des Véhicules
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marque *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.marque}
                    onChange={(e) => setFormData({...formData, marque: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modèle *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.modele}
                    onChange={(e) => setFormData({...formData, modele: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Immatriculation *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.immatriculation}
                    onChange={(e) => setFormData({...formData, immatriculation: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Année
                  </label>
                  <input
                    type="number"
                    value={formData.annee}
                    onChange={(e) => setFormData({...formData, annee: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kilométrage
                  </label>
                  <input
                    type="number"
                    value={formData.kilometrage}
                    onChange={(e) => setFormData({...formData, kilometrage: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="voiture">Voiture</option>
                    <option value="camion">Camion</option>
                    <option value="moto">Moto</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditingVehicule(null);
                    setFormData({
                      marque: '',
                      modele: '',
                      immatriculation: '',
                      annee: '',
                      kilometrage: '',
                      type: 'voiture',
                      statut: 'actif'
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Sauvegarde...' : editingVehicule ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>

            {/* Liste des véhicules */}
            <div className="border-t pt-4">
              <h4 className="text-md font-medium text-gray-900 mb-3">Véhicules existants</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {vehicules.filter(v => v.statut !== 'supprime').map(vehicule => (
                  <div key={vehicule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{vehicule.marque} {vehicule.modele}</div>
                      <div className="text-sm text-gray-500">{vehicule.immatriculation}</div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(vehicule)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(vehicule.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {vehicules.filter(v => v.statut !== 'supprime').length === 0 && (
                  <p className="text-gray-500 text-center py-4">Aucun véhicule enregistré</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Maintenance des Véhicules</h1>
        <p className="text-gray-600">Gérez les entretiens et la maintenance de votre flotte</p>
      </div>

      {/* Actions principales */}
      <div className="mb-6 flex flex-wrap gap-4">
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Maintenance
        </button>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowVehiculeModal(true)}
            className="btn btn-secondary flex items-center"
          >
            <Car className="h-4 w-4 mr-2" />
            Gérer Véhicules
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une maintenance..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="tous">Tous les statuts</option>
              <option value="planifiee">Planifiée</option>
              <option value="en_cours">En cours</option>
              <option value="terminee">Terminée</option>
              <option value="annulee">Annulée</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Véhicule
            </label>
            <select
              value={vehiculeFilter}
              onChange={(e) => setVehiculeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="tous">Tous les véhicules</option>
              {vehicules.map(vehicule => (
                <option key={vehicule.id} value={vehicule.id}>
                  {vehicule.marque} {vehicule.modele} - {vehicule.immatriculation}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Liste des maintenances */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Maintenances ({filteredMaintenances.length})
          </h2>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Chargement...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Véhicule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prestataire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMaintenances.map((maintenance) => (
                  <tr key={maintenance.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {maintenance.vehicule?.marque} {maintenance.vehicule?.modele}
                      </div>
                      <div className="text-sm text-gray-500">
                        {maintenance.vehicule?.immatriculation}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {maintenance.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {maintenance.datePrevue ? new Date(maintenance.datePrevue.seconds * 1000).toLocaleDateString('fr-FR') : 'Non définie'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {maintenance.prestataire?.nom || 'Non défini'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        maintenance.statut === 'terminee' ? 'bg-green-100 text-green-800' :
                        maintenance.statut === 'en_cours' ? 'bg-yellow-100 text-yellow-800' :
                        maintenance.statut === 'planifiee' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {maintenance.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedMaintenance(maintenance);
                            setShowCreateModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredMaintenances.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucune maintenance trouvée</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de création/modification de maintenance */}
      {showCreateModal && (
        <MaintenanceModal
          onClose={() => {
            setShowCreateModal(false);
            setSelectedMaintenance(null);
          }}
          onSave={loadData}
          maintenance={selectedMaintenance}
        />
      )}

      {/* Modal de gestion des véhicules */}
      {showVehiculeModal && (
        <VehiculeModal
          vehicules={vehicules}
          onClose={() => setShowVehiculeModal(false)}
          onSave={loadData}
        />
      )}
    </div>
  );
};

export default Maintenance;
