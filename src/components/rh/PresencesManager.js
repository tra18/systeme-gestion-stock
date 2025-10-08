import React, { useState } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Calendar, User } from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import toast from 'react-hot-toast';

const PresencesManager = ({ presences, employes, onRefresh }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    employeId: '',
    date: new Date().toISOString().split('T')[0],
    statut: 'present',
    heureArrivee: '',
    heureDepart: '',
    commentaire: ''
  });

  const statutsPresence = [
    { value: 'present', label: 'Présent', color: 'green', icon: CheckCircle },
    { value: 'absent', label: 'Absent', color: 'red', icon: XCircle },
    { value: 'retard', label: 'Retard', color: 'orange', icon: AlertCircle },
    { value: 'absent_justifie', label: 'Absent justifié', color: 'blue', icon: AlertCircle }
  ];

  // Pointage rapide pour tous les employés
  const handleQuickAttendance = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Vérifier si les présences du jour existent déjà
      const existingPresences = presences.filter(p => {
        const presenceDate = p.date?.toDate?.();
        if (!presenceDate) return false;
        presenceDate.setHours(0, 0, 0, 0);
        return presenceDate.getTime() === today.getTime();
      });

      if (existingPresences.length > 0) {
        toast.error('Les présences du jour sont déjà enregistrées');
        return;
      }

      const batch = [];
      for (const employe of employes.filter(e => e.statut === 'actif')) {
        const presenceData = {
          employeId: employe.id,
          date: today,
          statut: 'present',
          heureArrivee: '08:00',
          heureDepart: '17:00',
          commentaire: 'Pointage automatique',
          createdAt: new Date()
        };
        batch.push(addDoc(collection(db, 'presences'), presenceData));
      }

      await Promise.all(batch);
      toast.success(`Pointage effectué pour ${batch.length} employés`);
      onRefresh();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du pointage');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const presenceData = {
        ...formData,
        date: new Date(formData.date),
        createdAt: new Date()
      };

      await addDoc(collection(db, 'presences'), presenceData);
      toast.success('Présence enregistrée');
      
      setShowModal(false);
      resetForm();
      onRefresh();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (presenceId) => {
    if (window.confirm('Confirmer la suppression ?')) {
      try {
        await deleteDoc(doc(db, 'presences', presenceId));
        toast.success('Présence supprimée');
        onRefresh();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleUpdateStatut = async (presenceId, newStatut) => {
    try {
      await updateDoc(doc(db, 'presences', presenceId), {
        statut: newStatut,
        updatedAt: new Date()
      });
      toast.success('Statut mis à jour');
      onRefresh();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const resetForm = () => {
    setFormData({
      employeId: '',
      date: new Date().toISOString().split('T')[0],
      statut: 'present',
      heureArrivee: '',
      heureDepart: '',
      commentaire: ''
    });
  };

  // Filtrer les présences par date
  const filteredPresences = presences.filter(p => {
    const presenceDate = p.date?.toDate?.()?.toISOString().split('T')[0];
    return presenceDate === selectedDate;
  });

  // Statistiques du jour
  const stats = {
    total: filteredPresences.length,
    presents: filteredPresences.filter(p => p.statut === 'present').length,
    absents: filteredPresences.filter(p => p.statut === 'absent').length,
    retards: filteredPresences.filter(p => p.statut === 'retard').length,
    absentsJustifies: filteredPresences.filter(p => p.statut === 'absent_justifie').length
  };

  const getEmployeName = (employeId) => {
    const employe = employes.find(e => e.id === employeId);
    return employe?.nom || 'N/A';
  };

  const getStatutConfig = (statut) => {
    return statutsPresence.find(s => s.value === statut) || statutsPresence[0];
  };

  const getColorClasses = (color) => {
    const colors = {
      green: 'bg-green-100 text-green-800 border-green-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[color] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestion des Présences</h2>
          <p className="text-gray-600">Suivez la présence quotidienne des employés</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleQuickAttendance}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <CheckCircle size={20} />
            <span>Pointage rapide</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Clock size={20} />
            <span>Pointer</span>
          </button>
        </div>
      </div>

      {/* Sélecteur de date et statistiques */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
          <div className="flex items-center space-x-4">
            <Calendar className="text-gray-400" size={24} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="text-sm text-gray-600">
            Total: {stats.total} enregistrement(s)
          </div>
        </div>

        {/* Statistiques du jour */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.presents}</p>
                <p className="text-sm text-green-700">Présents</p>
              </div>
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.absents}</p>
                <p className="text-sm text-red-700">Absents</p>
              </div>
              <XCircle className="text-red-600" size={24} />
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600">{stats.retards}</p>
                <p className="text-sm text-orange-700">Retards</p>
              </div>
              <AlertCircle className="text-orange-600" size={24} />
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.absentsJustifies}</p>
                <p className="text-sm text-blue-700">Justifiés</p>
              </div>
              <AlertCircle className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Liste des présences */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employé</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Arrivée</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Départ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commentaire</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPresences.map(presence => {
                const statutConfig = getStatutConfig(presence.statut);
                const StatusIcon = statutConfig.icon;
                
                return (
                  <tr key={presence.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <User className="text-blue-600" size={20} />
                        </div>
                        <span className="text-sm font-medium text-gray-800">
                          {getEmployeName(presence.employeId)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative group">
                        <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getColorClasses(statutConfig.color)}`}>
                          <StatusIcon size={14} />
                          <span>{statutConfig.label}</span>
                        </span>
                        {/* Menu déroulant pour changer le statut */}
                        <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block z-10">
                          {statutsPresence.map(statut => (
                            <button
                              key={statut.value}
                              onClick={() => handleUpdateStatut(presence.id, statut.value)}
                              className={`w-full flex items-center space-x-2 px-4 py-2 text-sm text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                                statut.value === presence.statut ? 'bg-gray-100' : ''
                              }`}
                            >
                              <statut.icon size={16} />
                              <span>{statut.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {presence.heureArrivee || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {presence.heureDepart || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {presence.commentaire || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(presence.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredPresences.length === 0 && (
          <div className="text-center py-12">
            <Clock className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucune présence enregistrée</h3>
            <p className="text-gray-600">Aucune présence pour le {new Date(selectedDate).toLocaleDateString('fr-FR')}</p>
          </div>
        )}
      </div>

      {/* Modal de pointage */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Pointer une présence</h3>
            
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
                  {employes.filter(e => e.statut === 'actif').map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.nom}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut *
                </label>
                <select
                  value={formData.statut}
                  onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {statutsPresence.map(statut => (
                    <option key={statut.value} value={statut.value}>{statut.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heure arrivée
                  </label>
                  <input
                    type="time"
                    value={formData.heureArrivee}
                    onChange={(e) => setFormData({ ...formData, heureArrivee: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heure départ
                  </label>
                  <input
                    type="time"
                    value={formData.heureDepart}
                    onChange={(e) => setFormData({ ...formData, heureDepart: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Commentaire
                </label>
                <textarea
                  value={formData.commentaire}
                  onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Remarques éventuelles..."
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
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PresencesManager;

