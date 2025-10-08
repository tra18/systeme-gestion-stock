import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Users, 
  Mail, 
  Phone, 
  Building, 
  Eye, 
  Edit, 
  Trash2,
  UserCheck,
  Shield
} from 'lucide-react';
import { collection, query, orderBy, getDocs, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Employes = () => {
  const { userProfile } = useAuth();
  const [employes, setEmployes] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterService, setFilterService] = useState('tous');
  const [showModal, setShowModal] = useState(false);
  const [selectedEmploye, setSelectedEmploye] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadEmployes();
    loadServices();
  }, []);

  const loadEmployes = async () => {
    try {
      const employesQuery = query(collection(db, 'employes'), orderBy('nom'));
      const snapshot = await getDocs(employesQuery);
      const employesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEmployes(employesData);
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
      toast.error('Erreur lors du chargement des employés');
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      const servicesQuery = query(collection(db, 'services'), orderBy('nom'));
      const snapshot = await getDocs(servicesQuery);
      const servicesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setServices(servicesData);
    } catch (error) {
      console.error('Erreur lors du chargement des services:', error);
      toast.error('Erreur lors du chargement des services');
    }
  };


  const handleDelete = async (employeId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      try {
        await deleteDoc(doc(db, 'employes', employeId));
        toast.success('Employé supprimé avec succès');
        loadEmployes();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression de l\'employé');
      }
    }
  };

  const getServicesForFilter = () => {
    const services = [...new Set(employes.map(emp => emp.service).filter(Boolean))];
    return services;
  };

  const filteredEmployes = employes.filter(employe => {
    const matchesSearch = employe.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employe.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employe.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterService === 'tous' || employe.service === filterService;
    return matchesSearch && matchesFilter;
  });

  const getRoleColor = (role) => {
    switch (role) {
      case 'dg': return 'bg-purple-100 text-purple-800';
      case 'achat': return 'bg-blue-100 text-blue-800';
      case 'service': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'dg': return 'Directeur Général';
      case 'achat': return 'Service Achat';
      case 'service': return 'Service';
      default: return role;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Employés</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez les employés et leurs rôles dans l'organisation
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouvel employé
        </button>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher un employé..."
              className="form-input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="sm:w-48">
          <select
            className="form-input"
            value={filterService}
            onChange={(e) => setFilterService(e.target.value)}
          >
            <option value="tous">Tous les services</option>
            {getServicesForFilter().map(service => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tableau des employés */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployes.map((employe) => (
                <tr key={employe.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {employe.prenom} {employe.nom}
                        </div>
                        <div className="text-sm text-gray-500">
                          {employe.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                    <div className="flex items-center text-sm text-gray-900">
                      <Building className="h-4 w-4 mr-2 text-gray-400" />
                      {employe.service || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(employe.role)}`}>
                      <Shield className="h-3 w-3 mr-1" />
                      {getRoleText(employe.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                    <div className="space-y-1">
                      {employe.telephone && (
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {employe.telephone}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {employe.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      employe.actif ? 'bg-success-100 text-success-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      <UserCheck className="h-3 w-3 mr-1" />
                      {employe.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedEmploye(employe);
                          setShowModal(true);
                        }}
                        className="text-primary-600 hover:text-primary-900"
                        title="Voir détails"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedEmploye(employe);
                          setShowModal(true);
                        }}
                        className="text-warning-600 hover:text-warning-900"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(employe.id)}
                        className="text-danger-600 hover:text-danger-900"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de détails/modification */}
      {showModal && selectedEmploye && (
        <EmployeModal
          employe={selectedEmploye}
          onClose={() => {
            setShowModal(false);
            setSelectedEmploye(null);
          }}
          onSave={loadEmployes}
          userProfile={userProfile}
          services={services}
        />
      )}

      {/* Modal de création */}
      {showCreateModal && (
        <CreateEmployeModal
          onClose={() => setShowCreateModal(false)}
          onSave={loadEmployes}
          userProfile={userProfile}
          services={services}
        />
      )}
    </div>
  );
};

// Composant Modal pour les détails/modification
const EmployeModal = ({ employe, onClose, onSave, userProfile, services }) => {
  const [formData, setFormData] = useState({
    nom: employe.nom || '',
    prenom: employe.prenom || '',
    email: employe.email || '',
    telephone: employe.telephone || '',
    service: employe.service || '',
    role: employe.role || 'service',
    actif: employe.actif !== undefined ? employe.actif : true
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'employes', employe.id), {
        ...formData,
        updatedAt: new Date(),
        updatedBy: userProfile?.uid || 'system',
        updatedByName: userProfile?.nom || 'Système'
      });
      toast.success('Employé mis à jour');
      if (onSave) onSave();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Détails de l'employé
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Prénom *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.prenom}
                  onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="form-label">Nom *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.nom}
                  onChange={(e) => setFormData({...formData, nom: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="form-label">Email *</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className="form-label">Téléphone</label>
              <input
                type="tel"
                className="form-input"
                value={formData.telephone}
                onChange={(e) => setFormData({...formData, telephone: e.target.value})}
              />
            </div>
            
            <div>
              <label className="form-label">Service</label>
              <select
                className="form-input"
                value={formData.service}
                onChange={(e) => setFormData({...formData, service: e.target.value})}
              >
                <option value="">Sélectionner un service</option>
                {services.map(service => (
                  <option key={service.id} value={service.nom}>
                    {service.nom}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="form-label">Rôle</label>
              <select
                className="form-input"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="service">Service</option>
                <option value="achat">Service Achat</option>
                <option value="dg">Directeur Général</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="actif"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={formData.actif}
                onChange={(e) => setFormData({...formData, actif: e.target.checked})}
              />
              <label htmlFor="actif" className="ml-2 block text-sm text-gray-900">
                Employé actif
              </label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="btn btn-secondary"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant Modal pour la création
const CreateEmployeModal = ({ onClose, onSave, userProfile, services }) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    service: '',
    role: 'service',
    actif: true
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await addDoc(collection(db, 'employes'), {
        ...formData,
        createdBy: userProfile?.uid || 'system',
        createdByName: userProfile?.nom || 'Système',
        createdAt: new Date()
      });
      toast.success('Employé créé avec succès');
      if (onSave) onSave();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast.error('Erreur lors de la création de l\'employé');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Nouvel employé
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Prénom *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.prenom}
                  onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="form-label">Nom *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.nom}
                  onChange={(e) => setFormData({...formData, nom: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="form-label">Email *</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className="form-label">Téléphone</label>
              <input
                type="tel"
                className="form-input"
                value={formData.telephone}
                onChange={(e) => setFormData({...formData, telephone: e.target.value})}
              />
            </div>
            
            <div>
              <label className="form-label">Service</label>
              <select
                className="form-input"
                value={formData.service}
                onChange={(e) => setFormData({...formData, service: e.target.value})}
              >
                <option value="">Sélectionner un service</option>
                {services.map(service => (
                  <option key={service.id} value={service.nom}>
                    {service.nom}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="form-label">Rôle</label>
              <select
                className="form-input"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="service">Service</option>
                <option value="achat">Service Achat</option>
                <option value="dg">Directeur Général</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="actif"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={formData.actif}
                onChange={(e) => setFormData({...formData, actif: e.target.checked})}
              />
              <label htmlFor="actif" className="ml-2 block text-sm text-gray-900">
                Employé actif
              </label>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Création...' : 'Créer l\'employé'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Employes;
