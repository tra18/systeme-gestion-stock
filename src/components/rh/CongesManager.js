import React, { useState } from 'react';
import { Calendar, Check, X, Clock, User, FileText } from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import toast from 'react-hot-toast';

const CongesManager = ({ conges, employes, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedConge, setSelectedConge] = useState(null);
  const [filter, setFilter] = useState('tous');
  const [formData, setFormData] = useState({
    employeId: '',
    type: 'Congé annuel',
    dateDebut: '',
    dateFin: '',
    motif: '',
    statut: 'en_attente'
  });

  const typesConges = [
    'Congé annuel',
    'Congé maladie',
    'Congé sans solde',
    'Congé maternité',
    'Congé paternité',
    'Congé exceptionnel'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const dateDebut = new Date(formData.dateDebut);
      const dateFin = new Date(formData.dateFin);
      const duree = Math.ceil((dateFin - dateDebut) / (1000 * 60 * 60 * 24)) + 1;

      const congeData = {
        ...formData,
        dateDebut,
        dateFin,
        duree,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (selectedConge) {
        await updateDoc(doc(db, 'conges', selectedConge.id), congeData);
        toast.success('Congé modifié avec succès');
      } else {
        await addDoc(collection(db, 'conges'), congeData);
        toast.success('Demande de congé créée');
      }

      setShowModal(false);
      resetForm();
      onRefresh();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleApprove = async (congeId) => {
    try {
      await updateDoc(doc(db, 'conges', congeId), {
        statut: 'approuve',
        updatedAt: new Date()
      });
      toast.success('Congé approuvé');
      onRefresh();
    } catch (error) {
      toast.error('Erreur lors de l\'approbation');
    }
  };

  const handleReject = async (congeId) => {
    try {
      await updateDoc(doc(db, 'conges', congeId), {
        statut: 'refuse',
        updatedAt: new Date()
      });
      toast.success('Congé refusé');
      onRefresh();
    } catch (error) {
      toast.error('Erreur lors du refus');
    }
  };

  const handleDelete = async (congeId) => {
    if (window.confirm('Confirmer la suppression ?')) {
      try {
        await deleteDoc(doc(db, 'conges', congeId));
        toast.success('Congé supprimé');
        onRefresh();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      employeId: '',
      type: 'Congé annuel',
      dateDebut: '',
      dateFin: '',
      motif: '',
      statut: 'en_attente'
    });
    setSelectedConge(null);
  };

  const openModal = (conge = null) => {
    if (conge) {
      setSelectedConge(conge);
      setFormData({
        ...conge,
        dateDebut: conge.dateDebut?.toDate?.()?.toISOString().split('T')[0] || '',
        dateFin: conge.dateFin?.toDate?.()?.toISOString().split('T')[0] || ''
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const filteredConges = conges.filter(conge => {
    if (filter === 'tous') return true;
    return conge.statut === filter;
  });

  const getEmployeName = (employeId) => {
    const employe = employes.find(e => e.id === employeId);
    return employe?.nom || 'N/A';
  };

  const getStatusColor = (statut) => {
    const colors = {
      en_attente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approuve: 'bg-green-100 text-green-800 border-green-200',
      refuse: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[statut] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (statut) => {
    const labels = {
      en_attente: 'En attente',
      approuve: 'Approuvé',
      refuse: 'Refusé'
    };
    return labels[statut] || statut;
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec filtres */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestion des Congés</h2>
          <p className="text-gray-600">Gérez les demandes de congés des employés</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Calendar size={20} />
          <span>Nouvelle demande</span>
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('tous')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'tous'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tous ({conges.length})
          </button>
          <button
            onClick={() => setFilter('en_attente')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'en_attente'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            En attente ({conges.filter(c => c.statut === 'en_attente').length})
          </button>
          <button
            onClick={() => setFilter('approuve')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'approuve'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Approuvés ({conges.filter(c => c.statut === 'approuve').length})
          </button>
          <button
            onClick={() => setFilter('refuse')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'refuse'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Refusés ({conges.filter(c => c.statut === 'refuse').length})
          </button>
        </div>
      </div>

      {/* Liste des congés */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredConges.map(conge => (
          <div key={conge.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{getEmployeName(conge.employeId)}</h3>
                  <p className="text-sm text-gray-600">{conge.type}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(conge.statut)}`}>
                {getStatusLabel(conge.statut)}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar size={16} className="mr-2" />
                <span>
                  {conge.dateDebut?.toDate?.()?.toLocaleDateString('fr-FR')} - {' '}
                  {conge.dateFin?.toDate?.()?.toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock size={16} className="mr-2" />
                <span>{conge.duree} jour(s)</span>
              </div>
              {conge.motif && (
                <div className="flex items-start text-sm text-gray-600">
                  <FileText size={16} className="mr-2 mt-0.5" />
                  <span className="flex-1">{conge.motif}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              {conge.statut === 'en_attente' && (
                <>
                  <button
                    onClick={() => handleApprove(conge.id)}
                    className="flex-1 flex items-center justify-center space-x-1 bg-green-50 text-green-600 px-3 py-2 rounded-lg hover:bg-green-100 transition text-sm"
                  >
                    <Check size={16} />
                    <span>Approuver</span>
                  </button>
                  <button
                    onClick={() => handleReject(conge.id)}
                    className="flex-1 flex items-center justify-center space-x-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition text-sm"
                  >
                    <X size={16} />
                    <span>Refuser</span>
                  </button>
                </>
              )}
              <button
                onClick={() => handleDelete(conge.id)}
                className="flex items-center justify-center space-x-1 bg-gray-50 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-100 transition text-sm"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredConges.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucun congé trouvé</h3>
          <p className="text-gray-600">
            {filter === 'tous' 
              ? 'Aucune demande de congé enregistrée'
              : `Aucune demande ${getStatusLabel(filter).toLowerCase()}`
            }
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {selectedConge ? 'Modifier' : 'Nouvelle'} demande de congé
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employé *
                </label>
                <select
                  value={formData.employeId}
                  onChange={(e) => setFormData({ ...formData, employeId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionner un employé</option>
                  {employes.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.nom}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de congé *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {typesConges.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date début *
                  </label>
                  <input
                    type="date"
                    value={formData.dateDebut}
                    onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date fin *
                  </label>
                  <input
                    type="date"
                    value={formData.dateFin}
                    onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motif
                </label>
                <textarea
                  value={formData.motif}
                  onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Raison de la demande..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {selectedConge ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CongesManager;

