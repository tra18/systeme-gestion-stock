import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, Clock, DollarSign,
  Award, UserPlus,
  Edit2, Trash2, Eye,
  BarChart3
} from 'lucide-react';
import { db } from '../firebase/config';
import { 
  collection, 
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import CongesManager from '../components/rh/CongesManager';
import PresencesManager from '../components/rh/PresencesManager';
import SalairesManager from '../components/rh/SalairesManager';
import EvaluationsManager from '../components/rh/EvaluationsManager';

const RessourcesHumaines = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [employes, setEmployes] = useState([]);
  const [conges, setConges] = useState([]);
  const [presences, setPresences] = useState([]);
  const [salaires, setSalaires] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  // Charger les données au montage du composant
  useEffect(() => {
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadEmployes(),
        loadConges(),
        loadPresences(),
        loadSalaires(),
        loadEvaluations()
      ]);
    } catch (error) {
      console.error('Erreur chargement données RH:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployes = async () => {
    const snapshot = await getDocs(collection(db, 'employes'));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setEmployes(data);
  };

  const loadConges = async () => {
    const snapshot = await getDocs(collection(db, 'conges'));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setConges(data);
  };

  const loadPresences = async () => {
    const snapshot = await getDocs(collection(db, 'presences'));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPresences(data);
  };

  const loadSalaires = async () => {
    const snapshot = await getDocs(collection(db, 'salaires'));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setSalaires(data);
  };

  const loadEvaluations = async () => {
    const snapshot = await getDocs(collection(db, 'evaluations'));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setEvaluations(data);
  };

  // Statistiques du tableau de bord
  const stats = {
    totalEmployes: employes.length,
    employesActifs: employes.filter(e => e.statut === 'actif').length,
    congesEnAttente: conges.filter(c => c.statut === 'en_attente').length,
    presencesAujourdhui: presences.filter(p => {
      const today = new Date().toDateString();
      const presenceDate = p.date?.toDate?.()?.toDateString();
      return presenceDate === today;
    }).length
  };

  // Fonction pour ouvrir le modal
  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setSelectedItem(null);
  };

  // Rendu du Dashboard
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Total Employés"
          value={stats.totalEmployes}
          subtitle={`${stats.employesActifs} actifs`}
          color="blue"
        />
        <StatCard
          icon={Calendar}
          title="Congés en attente"
          value={stats.congesEnAttente}
          subtitle="À traiter"
          color="orange"
        />
        <StatCard
          icon={Clock}
          title="Présences aujourd'hui"
          value={stats.presencesAujourdhui}
          subtitle={`/ ${stats.employesActifs}`}
          color="green"
        />
        <StatCard
          icon={DollarSign}
          title="Masse salariale"
          value={`${calculateTotalSalaire()} GNF`}
          subtitle="Mensuel"
          color="purple"
        />
      </div>

      {/* Graphiques et activités récentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Congés récents */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Demandes de congés récentes</h3>
            <button 
              onClick={() => setActiveTab('conges')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Voir tout
            </button>
          </div>
          <div className="space-y-3">
            {conges.slice(0, 5).map(conge => (
              <CongeItem key={conge.id} conge={conge} employes={employes} />
            ))}
            {conges.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">Aucune demande de congé</p>
            )}
          </div>
        </div>

        {/* Évaluations à venir */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Évaluations à venir</h3>
            <button 
              onClick={() => setActiveTab('evaluations')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Voir tout
            </button>
          </div>
          <div className="space-y-3">
            {evaluations.slice(0, 5).map(evaluation => (
              <EvaluationItem key={evaluation.id} evaluation={evaluation} employes={employes} />
            ))}
            {evaluations.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">Aucune évaluation prévue</p>
            )}
          </div>
        </div>
      </div>

      {/* Graphique de présence */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Vue d'ensemble des présences</h3>
        <PresenceChart presences={presences} />
      </div>
    </div>
  );

  // Calculer la masse salariale totale
  const calculateTotalSalaire = () => {
    const total = employes
      .filter(e => e.statut === 'actif')
      .reduce((sum, e) => sum + (parseFloat(e.salaire) || 0), 0);
    return total.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données RH...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Gestion des Ressources Humaines
        </h1>
        <p className="text-gray-600">
          Gérez vos employés, congés, présences, salaires et évaluations
        </p>
      </div>

      {/* Navigation par onglets */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="flex flex-wrap border-b">
          <TabButton
            active={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
            icon={BarChart3}
            label="Tableau de bord"
          />
          <TabButton
            active={activeTab === 'employes'}
            onClick={() => setActiveTab('employes')}
            icon={Users}
            label="Employés"
          />
          <TabButton
            active={activeTab === 'conges'}
            onClick={() => setActiveTab('conges')}
            icon={Calendar}
            label="Congés"
          />
          <TabButton
            active={activeTab === 'presences'}
            onClick={() => setActiveTab('presences')}
            icon={Clock}
            label="Présences"
          />
          <TabButton
            active={activeTab === 'salaires'}
            onClick={() => setActiveTab('salaires')}
            icon={DollarSign}
            label="Salaires"
          />
          <TabButton
            active={activeTab === 'evaluations'}
            onClick={() => setActiveTab('evaluations')}
            icon={Award}
            label="Évaluations"
          />
        </div>
      </div>

      {/* Contenu selon l'onglet actif */}
      <div>
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'employes' && <EmployesTab employes={employes} onRefresh={loadEmployes} openModal={openModal} />}
        {activeTab === 'conges' && <CongesTab conges={conges} employes={employes} onRefresh={loadConges} />}
        {activeTab === 'presences' && <PresencesTab presences={presences} employes={employes} onRefresh={loadPresences} />}
        {activeTab === 'salaires' && <SalairesTab salaires={salaires} employes={employes} onRefresh={loadSalaires} />}
        {activeTab === 'evaluations' && <EvaluationsTab evaluations={evaluations} employes={employes} onRefresh={loadEvaluations} />}
      </div>

      {/* Modal */}
      {showModal && (
        <Modal
          type={modalType}
          item={selectedItem}
          employes={employes}
          onClose={closeModal}
          onSave={() => {
            closeModal();
            loadAllData();
          }}
        />
      )}
    </div>
  );
};

// Composant StatCard
const StatCard = ({ icon: Icon, title, value, subtitle, color }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    orange: 'bg-orange-100 text-orange-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className={`${colors[color]} p-3 rounded-lg`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

// Composant TabButton
const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-colors ${
      active
        ? 'border-blue-600 text-blue-600 font-semibold'
        : 'border-transparent text-gray-600 hover:text-gray-800'
    }`}
  >
    <Icon size={20} />
    <span>{label}</span>
  </button>
);

// Composant CongeItem
const CongeItem = ({ conge, employes }) => {
  const employe = employes.find(e => e.id === conge.employeId);
  const statusColors = {
    en_attente: 'bg-yellow-100 text-yellow-800',
    approuve: 'bg-green-100 text-green-800',
    refuse: 'bg-red-100 text-red-800'
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <p className="font-medium text-gray-800">{employe?.nom || 'N/A'}</p>
        <p className="text-sm text-gray-600">{conge.type} - {conge.duree} jours</p>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[conge.statut]}`}>
        {conge.statut?.replace('_', ' ')}
      </span>
    </div>
  );
};

// Composant EvaluationItem
const EvaluationItem = ({ evaluation, employes }) => {
  const employe = employes.find(e => e.id === evaluation.employeId);
  
  // Convertir la date Firestore en chaîne lisible
  const formatDate = (date) => {
    if (!date) return 'N/A';
    if (date.toDate) {
      return date.toDate().toLocaleDateString('fr-FR');
    }
    return new Date(date).toLocaleDateString('fr-FR');
  };
  
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <p className="font-medium text-gray-800">{employe?.nom || 'N/A'}</p>
        <p className="text-sm text-gray-600">{evaluation.type}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-gray-800">{evaluation.note}/5</p>
        <p className="text-xs text-gray-600">{formatDate(evaluation.date)}</p>
      </div>
    </div>
  );
};

// Composant PresenceChart (simple)
const PresenceChart = ({ presences }) => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const data = last7Days.map(date => {
    const dateStr = date.toDateString();
    const count = presences.filter(p => {
      const presenceDate = p.date?.toDate?.()?.toDateString();
      return presenceDate === dateStr && p.statut === 'present';
    }).length;
    return { date: date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }), count };
  });

  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between h-48 space-x-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div className="w-full bg-gray-200 rounded-t-lg relative" style={{ height: '100%' }}>
              <div
                className="w-full bg-blue-600 rounded-t-lg absolute bottom-0 transition-all"
                style={{ height: `${(item.count / maxCount) * 100}%` }}
              >
                <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium">
                  {item.count}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">{item.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Placeholder components for tabs
const EmployesTab = ({ employes, onRefresh, openModal }) => (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold text-gray-800">Liste des employés</h2>
      <button
        onClick={() => openModal('employe')}
        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        <UserPlus size={20} />
        <span>Ajouter un employé</span>
      </button>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Poste</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Département</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salaire</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {employes.map(employe => (
            <tr key={employe.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-800">{employe.nom}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{employe.poste}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{employe.departement}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{employe.salaire} GNF</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  employe.statut === 'actif' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {employe.statut}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => openModal('view-employe', employe)}
                    className="text-blue-600 hover:text-blue-700"
                    title="Voir les détails"
                  >
                    <Eye size={18} />
                  </button>
                  <button 
                    onClick={() => openModal('edit-employe', employe)}
                    className="text-yellow-600 hover:text-yellow-700"
                    title="Modifier l'employé"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => openModal('delete-employe', employe)}
                    className="text-red-600 hover:text-red-700"
                    title="Supprimer l'employé"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const CongesTab = ({ conges, employes, onRefresh }) => (
  <CongesManager conges={conges} employes={employes} onRefresh={onRefresh} />
);

const PresencesTab = ({ presences, employes, onRefresh }) => (
  <PresencesManager presences={presences} employes={employes} onRefresh={onRefresh} />
);

const SalairesTab = ({ salaires, employes, onRefresh }) => (
  <SalairesManager salaires={salaires} employes={employes} onRefresh={onRefresh} />
);

const EvaluationsTab = ({ evaluations, employes, onRefresh }) => (
  <EvaluationsManager evaluations={evaluations} employes={employes} onRefresh={onRefresh} />
);

// Modal pour employés
const Modal = ({ type, item, employes, onClose, onSave }) => {
  const [formData, setFormData] = useState(item || {});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (type === 'employe' || type === 'edit-employe') {
        // Créer ou modifier un employé
        const employeData = {
          nom: formData.nom,
          prenom: formData.prenom || '',
          poste: formData.poste,
          departement: formData.departement,
          salaire: parseFloat(formData.salaire) || 0,
          email: formData.email || '',
          telephone: formData.telephone || '',
          statut: formData.statut || 'actif',
          dateEmbauche: formData.dateEmbauche || new Date().toISOString().split('T')[0],
          updatedAt: new Date()
        };

        if (type === 'edit-employe' && item?.id) {
          // Mise à jour
          await updateDoc(doc(db, 'employes', item.id), employeData);
          toast.success('✅ Employé modifié avec succès');
        } else {
          // Création
          employeData.createdAt = new Date();
          await addDoc(collection(db, 'employes'), employeData);
          toast.success('✅ Employé ajouté avec succès');
        }
      } else if (type === 'delete-employe' && item?.id) {
        // Suppression
        await deleteDoc(doc(db, 'employes', item.id));
        toast.success('✅ Employé supprimé avec succès');
      }
      
      onSave();
    } catch (error) {
      console.error('Erreur modal employé:', error);
      toast.error('❌ Erreur lors de l\'opération');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Modal de suppression
  if (type === 'delete-employe') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full">
          <h3 className="text-xl font-bold mb-4 text-red-600">⚠️ Confirmer la suppression</h3>
          <p className="text-gray-600 mb-4">
            Êtes-vous sûr de vouloir supprimer l'employé <strong>{item?.nom}</strong> ?
            Cette action est irréversible.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Suppression...' : 'Supprimer'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Modal de visualisation
  if (type === 'view-employe') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <h3 className="text-xl font-bold mb-4">👤 Détails de l'employé</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Nom complet</p>
              <p className="font-medium">{item?.nom} {item?.prenom}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Poste</p>
              <p className="font-medium">{item?.poste}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Département</p>
              <p className="font-medium">{item?.departement}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Salaire</p>
              <p className="font-medium">{item?.salaire} GNF</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{item?.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Téléphone</p>
              <p className="font-medium">{item?.telephone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Statut</p>
              <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                item?.statut === 'actif' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {item?.statut}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date d'embauche</p>
              <p className="font-medium">{item?.dateEmbauche || 'N/A'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  // Modal de création/édition
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">
          {type === 'edit-employe' ? '✏️ Modifier l\'employé' : '➕ Ajouter un employé'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom *
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom || ''}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom
              </label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Poste *
              </label>
              <input
                type="text"
                name="poste"
                value={formData.poste || ''}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Département *
              </label>
              <input
                type="text"
                name="departement"
                value={formData.departement || ''}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salaire (GNF) *
              </label>
              <input
                type="number"
                name="salaire"
                value={formData.salaire || ''}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                name="statut"
                value={formData.statut || 'actif'}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
                <option value="conge">En congé</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date d'embauche
              </label>
              <input
                type="date"
                name="dateEmbauche"
                value={formData.dateEmbauche || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RessourcesHumaines;

