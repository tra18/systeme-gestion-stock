import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const TeamPlanning = ({ employes }) => {
  const { userProfile } = useAuth();
  const [plannings, setPlannings] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPlanning, setSelectedPlanning] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const [formData, setFormData] = useState({
    employeId: '',
    date: '',
    heureDebut: '',
    heureFin: '',
    type: 'travail', // travail, congé, formation, mission
    description: '',
    statut: 'planifie' // planifie, confirme, annule
  });

  useEffect(() => {
    loadPlannings();
  }, []);

  const loadPlannings = async () => {
    try {
      const planningsQuery = collection(db, 'plannings');
      const snapshot = await getDocs(planningsQuery);
      
      const planningsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setPlannings(planningsData);
    } catch (error) {
      console.error('Erreur lors du chargement des plannings:', error);
      toast.error('Erreur lors du chargement des plannings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const planningData = {
        ...formData,
        employeNom: employes.find(emp => emp.id === formData.employeId)?.nom || 'Inconnu',
        employePrenom: employes.find(emp => emp.id === formData.employeId)?.prenom || '',
        createdAt: new Date(),
        createdBy: userProfile?.uid || 'system',
        createdByName: userProfile?.nom || 'Système'
      };

      if (selectedPlanning) {
        // Modification
        await updateDoc(doc(db, 'plannings', selectedPlanning.id), planningData);
        toast.success('Planning modifié avec succès');
      } else {
        // Création
        await addDoc(collection(db, 'plannings'), planningData);
        toast.success('Planning créé avec succès');
      }

      setShowCreateModal(false);
      setSelectedPlanning(null);
      resetForm();
      loadPlannings();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde du planning');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (planning) => {
    setSelectedPlanning(planning);
    setFormData({
      employeId: planning.employeId,
      date: planning.date,
      heureDebut: planning.heureDebut,
      heureFin: planning.heureFin,
      type: planning.type,
      description: planning.description,
      statut: planning.statut
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (planningId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce planning ?')) {
      try {
        await deleteDoc(doc(db, 'plannings', planningId));
        toast.success('Planning supprimé avec succès');
        loadPlannings();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      employeId: '',
      date: '',
      heureDebut: '',
      heureFin: '',
      type: 'travail',
      description: '',
      statut: 'planifie'
    });
  };

  const getWeekDates = (date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      dates.push(day);
    }
    return dates;
  };

  const getPlanningForDate = (employeId, date) => {
    return plannings.filter(p => 
      p.employeId === employeId && 
      p.date === date.toISOString().split('T')[0]
    );
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'travail': return 'bg-blue-100 text-blue-800';
      case 'congé': return 'bg-green-100 text-green-800';
      case 'formation': return 'bg-purple-100 text-purple-800';
      case 'mission': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const weekDates = getWeekDates(currentWeek);

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
          <h2 className="text-2xl font-bold text-gray-900">Planning des Équipes</h2>
          <p className="text-gray-600">Gérez les plannings et horaires des employés</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setCurrentWeek(new Date(currentWeek.getTime() - 7 * 24 * 60 * 60 * 1000))}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            ← Semaine précédente
          </button>
          <button
            onClick={() => setCurrentWeek(new Date())}
            className="px-3 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors"
          >
            Cette semaine
          </button>
          <button
            onClick={() => setCurrentWeek(new Date(currentWeek.getTime() + 7 * 24 * 60 * 60 * 1000))}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Semaine suivante →
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Ajouter Planning
          </button>
        </div>
      </div>

      {/* Grille de planning */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employé
                </th>
                {weekDates.map((date, index) => (
                  <th key={index} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex flex-col items-center">
                      <span className="font-semibold">
                        {date.toLocaleDateString('fr-FR', { weekday: 'short' })}
                      </span>
                      <span className="text-lg">
                        {date.getDate()}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employes.map((employe) => (
                <tr key={employe.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-teal-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {employe.nom} {employe.prenom}
                        </div>
                        <div className="text-sm text-gray-500">{employe.poste}</div>
                      </div>
                    </div>
                  </td>
                  {weekDates.map((date, index) => {
                    const dayPlannings = getPlanningForDate(employe.id, date);
                    return (
                      <td key={index} className="px-4 py-4 text-center">
                        <div className="space-y-1">
                          {dayPlannings.map((planning) => (
                            <div key={planning.id} className="relative group">
                              <div className={`px-2 py-1 rounded text-xs cursor-pointer ${getTypeColor(planning.type)}`}>
                                <div className="flex items-center justify-between">
                                  <span>{planning.heureDebut} - {planning.heureFin}</span>
                                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => handleEdit(planning)}
                                      className="text-blue-600 hover:text-blue-800"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(planning.id)}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                                <div className="text-xs opacity-75">{planning.type}</div>
                              </div>
                            </div>
                          ))}
                          {dayPlannings.length === 0 && (
                            <button
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  employeId: employe.id,
                                  date: date.toISOString().split('T')[0]
                                });
                                setShowCreateModal(true);
                              }}
                              className="text-gray-400 hover:text-gray-600 text-xs"
                            >
                              + Ajouter
                            </button>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de création/édition */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedPlanning ? 'Modifier le planning' : 'Nouveau planning'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedPlanning(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Employé
                  </label>
                  <select
                    value={formData.employeId}
                    onChange={(e) => setFormData({ ...formData, employeId: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    required
                  >
                    <option value="">Sélectionner un employé</option>
                    {employes.map((employe) => (
                      <option key={employe.id} value={employe.id}>
                        {employe.nom} {employe.prenom} - {employe.poste}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Heure début
                    </label>
                    <input
                      type="time"
                      value={formData.heureDebut}
                      onChange={(e) => setFormData({ ...formData, heureDebut: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Heure fin
                    </label>
                    <input
                      type="time"
                      value={formData.heureFin}
                      onChange={(e) => setFormData({ ...formData, heureFin: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="travail">Travail</option>
                    <option value="congé">Congé</option>
                    <option value="formation">Formation</option>
                    <option value="mission">Mission</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Description du planning..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Statut
                  </label>
                  <select
                    value={formData.statut}
                    onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="planifie">Planifié</option>
                    <option value="confirme">Confirmé</option>
                    <option value="annule">Annulé</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setSelectedPlanning(null);
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
                        <Save className="h-4 w-4 mr-2" />
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

export default TeamPlanning;
