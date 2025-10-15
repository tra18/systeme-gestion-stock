import React, { useState, useEffect } from 'react';
import { Award, Star, TrendingUp, Plus, Edit, Trash2, Save, X, Target } from 'lucide-react';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const SkillsManagement = ({ employes }) => {
  const { userProfile } = useAuth();
  const [competences, setCompetences] = useState([]);
  const [skills, setSkills] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCompetence, setSelectedCompetence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEmploye, setSelectedEmploye] = useState('');

  const [formData, setFormData] = useState({
    employeId: '',
    skillId: '',
    niveau: 1, // 1-5
    certification: '',
    dateAcquisition: '',
    dateExpiration: '',
    notes: ''
  });

  useEffect(() => {
    loadCompetences();
    loadSkills();
  }, []);

  const loadCompetences = async () => {
    try {
      const competencesQuery = collection(db, 'competences');
      const snapshot = await getDocs(competencesQuery);
      
      const competencesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCompetences(competencesData);
    } catch (error) {
      console.error('Erreur lors du chargement des compétences:', error);
      toast.error('Erreur lors du chargement des compétences');
    } finally {
      setLoading(false);
    }
  };

  const loadSkills = async () => {
    try {
      const skillsQuery = collection(db, 'skills');
      const snapshot = await getDocs(skillsQuery);
      
      const skillsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setSkills(skillsData);
    } catch (error) {
      console.error('Erreur lors du chargement des skills:', error);
      toast.error('Erreur lors du chargement des skills');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const competenceData = {
        ...formData,
        employeNom: employes.find(emp => emp.id === formData.employeId)?.nom || 'Inconnu',
        employePrenom: employes.find(emp => emp.id === formData.employeId)?.prenom || '',
        skillNom: skills.find(skill => skill.id === formData.skillId)?.nom || 'Inconnu',
        createdAt: new Date(),
        createdBy: userProfile?.uid || 'system',
        createdByName: userProfile?.nom || 'Système'
      };

      if (selectedCompetence) {
        await updateDoc(doc(db, 'competences', selectedCompetence.id), competenceData);
        toast.success('Compétence modifiée avec succès');
      } else {
        await addDoc(collection(db, 'competences'), competenceData);
        toast.success('Compétence ajoutée avec succès');
      }

      setShowCreateModal(false);
      setSelectedCompetence(null);
      resetForm();
      loadCompetences();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde de la compétence');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (competence) => {
    setSelectedCompetence(competence);
    setFormData({
      employeId: competence.employeId,
      skillId: competence.skillId,
      niveau: competence.niveau,
      certification: competence.certification || '',
      dateAcquisition: competence.dateAcquisition || '',
      dateExpiration: competence.dateExpiration || '',
      notes: competence.notes || ''
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (competenceId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette compétence ?')) {
      try {
        await deleteDoc(doc(db, 'competences', competenceId));
        toast.success('Compétence supprimée avec succès');
        loadCompetences();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      employeId: '',
      skillId: '',
      niveau: 1,
      certification: '',
      dateAcquisition: '',
      dateExpiration: '',
      notes: ''
    });
  };

  const getCompetencesByEmploye = (employeId) => {
    return competences.filter(c => c.employeId === employeId);
  };

  const getNiveauStars = (niveau) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < niveau ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getNiveauColor = (niveau) => {
    if (niveau >= 4) return 'bg-green-100 text-green-800';
    if (niveau >= 3) return 'bg-blue-100 text-blue-800';
    if (niveau >= 2) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const competencesFiltered = selectedEmploye 
    ? competences.filter(c => c.employeId === selectedEmploye)
    : competences;

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
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Compétences</h2>
          <p className="text-gray-600">Suivez et évaluez les compétences des employés</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedEmploye}
            onChange={(e) => setSelectedEmploye(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="">Tous les employés</option>
            {employes.map((employe) => (
              <option key={employe.id} value={employe.id}>
                {employe.nom} {employe.prenom}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Ajouter Compétence
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="h-8 w-8 text-teal-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Compétences totales
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {competences.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Niveau moyen
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {competences.length > 0 
                    ? (competences.reduce((sum, c) => sum + c.niveau, 0) / competences.length).toFixed(1)
                    : '0'
                  }
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Skills disponibles
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {skills.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des compétences */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {competencesFiltered.map((competence) => {
            const employe = employes.find(e => e.id === competence.employeId);
            const skill = skills.find(s => s.id === competence.skillId);
            
            return (
              <li key={competence.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                        <Award className="h-5 w-5 text-teal-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {skill?.nom || 'Compétence supprimée'}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getNiveauColor(competence.niveau)}`}>
                          Niveau {competence.niveau}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center space-x-2">
                        <p className="text-sm text-gray-500">
                          {employe ? `${employe.nom} ${employe.prenom}` : 'Employé supprimé'}
                        </p>
                        <div className="flex items-center space-x-1">
                          {getNiveauStars(competence.niveau)}
                        </div>
                      </div>
                      {competence.certification && (
                        <p className="text-xs text-blue-600 mt-1">
                          📜 Certification: {competence.certification}
                        </p>
                      )}
                      {competence.notes && (
                        <p className="text-xs text-gray-600 mt-1">
                          {competence.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(competence)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(competence.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Modal de création/édition */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedCompetence ? 'Modifier la compétence' : 'Nouvelle compétence'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedCompetence(null);
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
                    Compétence
                  </label>
                  <select
                    value={formData.skillId}
                    onChange={(e) => setFormData({ ...formData, skillId: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    required
                  >
                    <option value="">Sélectionner une compétence</option>
                    {skills.map((skill) => (
                      <option key={skill.id} value={skill.id}>
                        {skill.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Niveau (1-5)
                  </label>
                  <div className="mt-2">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={formData.niveau}
                      onChange={(e) => setFormData({ ...formData, niveau: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>Débutant</span>
                      <div className="flex items-center space-x-1">
                        {getNiveauStars(formData.niveau)}
                      </div>
                      <span>Expert</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Certification
                  </label>
                  <input
                    type="text"
                    value={formData.certification}
                    onChange={(e) => setFormData({ ...formData, certification: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Nom de la certification..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Date d'acquisition
                    </label>
                    <input
                      type="date"
                      value={formData.dateAcquisition}
                      onChange={(e) => setFormData({ ...formData, dateAcquisition: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Date d'expiration
                    </label>
                    <input
                      type="date"
                      value={formData.dateExpiration}
                      onChange={(e) => setFormData({ ...formData, dateExpiration: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
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
                    placeholder="Notes sur la compétence..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setSelectedCompetence(null);
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

export default SkillsManagement;
