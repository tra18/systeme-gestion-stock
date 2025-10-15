import React, { useState, useEffect } from 'react';
import { Users, Star, TrendingUp, Plus, Eye, Edit, Trash2, Save, X, MessageSquare } from 'lucide-react';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const Evaluations360 = ({ employes }) => {
  const { userProfile } = useAuth();
  const [evaluations, setEvaluations] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEmploye, setSelectedEmploye] = useState('');

  const [formData, setFormData] = useState({
    employeEvalueId: '',
    evaluateurId: '',
    typeEvaluation: 'annuelle', // annuelle, trimestrielle, probation
    periode: '',
    competences: {
      technique: 1,
      communication: 1,
      leadership: 1,
      travailEquipe: 1,
      innovation: 1,
      fiabilite: 1
    },
    objectifs: '',
    realisations: '',
    pointsForts: '',
    axesAmelioration: '',
    recommandations: '',
    statut: 'en_cours' // en_cours, finalisee, archivee
  });

  const competencesLabels = {
    technique: 'Compétences techniques',
    communication: 'Communication',
    leadership: 'Leadership',
    travailEquipe: 'Travail d\'équipe',
    innovation: 'Innovation',
    fiabilite: 'Fiabilité'
  };

  useEffect(() => {
    loadEvaluations();
  }, []);

  const loadEvaluations = async () => {
    try {
      const evaluationsQuery = collection(db, 'evaluations360');
      const snapshot = await getDocs(evaluationsQuery);
      
      const evaluationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setEvaluations(evaluationsData);
    } catch (error) {
      console.error('Erreur lors du chargement des évaluations:', error);
      toast.error('Erreur lors du chargement des évaluations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const evaluationData = {
        ...formData,
        employeEvalueNom: employes.find(emp => emp.id === formData.employeEvalueId)?.nom || 'Inconnu',
        employeEvaluePrenom: employes.find(emp => emp.id === formData.employeEvalueId)?.prenom || '',
        evaluateurNom: employes.find(emp => emp.id === formData.evaluateurId)?.nom || 'Inconnu',
        evaluateurPrenom: employes.find(emp => emp.id === formData.evaluateurId)?.prenom || '',
        scoreMoyen: Object.values(formData.competences).reduce((sum, score) => sum + score, 0) / Object.keys(formData.competences).length,
        createdAt: new Date(),
        createdBy: userProfile?.uid || 'system',
        createdByName: userProfile?.nom || 'Système'
      };

      if (selectedEvaluation) {
        await updateDoc(doc(db, 'evaluations360', selectedEvaluation.id), evaluationData);
        toast.success('Évaluation modifiée avec succès');
      } else {
        await addDoc(collection(db, 'evaluations360'), evaluationData);
        toast.success('Évaluation créée avec succès');
      }

      setShowCreateModal(false);
      setSelectedEvaluation(null);
      resetForm();
      loadEvaluations();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde de l\'évaluation');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setFormData({
      employeEvalueId: evaluation.employeEvalueId,
      evaluateurId: evaluation.evaluateurId,
      typeEvaluation: evaluation.typeEvaluation,
      periode: evaluation.periode,
      competences: evaluation.competences,
      objectifs: evaluation.objectifs || '',
      realisations: evaluation.realisations || '',
      pointsForts: evaluation.pointsForts || '',
      axesAmelioration: evaluation.axesAmelioration || '',
      recommandations: evaluation.recommandations || '',
      statut: evaluation.statut
    });
    setShowCreateModal(true);
  };

  const handleView = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setShowDetailModal(true);
  };

  const handleDelete = async (evaluationId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette évaluation ?')) {
      try {
        await deleteDoc(doc(db, 'evaluations360', evaluationId));
        toast.success('Évaluation supprimée avec succès');
        loadEvaluations();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      employeEvalueId: '',
      evaluateurId: '',
      typeEvaluation: 'annuelle',
      periode: '',
      competences: {
        technique: 1,
        communication: 1,
        leadership: 1,
        travailEquipe: 1,
        innovation: 1,
        fiabilite: 1
      },
      objectifs: '',
      realisations: '',
      pointsForts: '',
      axesAmelioration: '',
      recommandations: '',
      statut: 'en_cours'
    });
  };

  const getScoreStars = (score) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < score ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'en_cours': return 'bg-yellow-100 text-yellow-800';
      case 'finalisee': return 'bg-green-100 text-green-800';
      case 'archivee': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'annuelle': return 'bg-blue-100 text-blue-800';
      case 'trimestrielle': return 'bg-purple-100 text-purple-800';
      case 'probation': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const evaluationsFiltered = selectedEmploye 
    ? evaluations.filter(e => e.employeEvalueId === selectedEmploye)
    : evaluations;

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
          <h2 className="text-2xl font-bold text-gray-900">Évaluations 360°</h2>
          <p className="text-gray-600">Gérez les évaluations multidirectionnelles des employés</p>
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
            Nouvelle Évaluation
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-teal-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Évaluations totales
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {evaluations.length}
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
                  Score moyen
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {evaluations.length > 0 
                    ? (evaluations.reduce((sum, e) => sum + e.scoreMoyen, 0) / evaluations.length).toFixed(1)
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
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  En cours
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {evaluations.filter(e => e.statut === 'en_cours').length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MessageSquare className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Finalisées
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {evaluations.filter(e => e.statut === 'finalisee').length}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des évaluations */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {evaluationsFiltered.map((evaluation) => {
            const employe = employes.find(e => e.id === evaluation.employeEvalueId);
            const evaluateur = employes.find(e => e.id === evaluation.evaluateurId);
            
            return (
              <li key={evaluation.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-teal-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {employe ? `${employe.nom} ${employe.prenom}` : 'Employé supprimé'}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(evaluation.typeEvaluation)}`}>
                          {evaluation.typeEvaluation}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatutColor(evaluation.statut)}`}>
                          {evaluation.statut.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center space-x-4">
                        <p className="text-sm text-gray-500">
                          Évaluateur: {evaluateur ? `${evaluateur.nom} ${evaluateur.prenom}` : 'Supprimé'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Période: {evaluation.periode}
                        </p>
                        <div className="flex items-center space-x-1">
                          {getScoreStars(Math.round(evaluation.scoreMoyen))}
                          <span className="text-sm text-gray-600">
                            ({evaluation.scoreMoyen.toFixed(1)}/5)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleView(evaluation)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Voir détails"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(evaluation)}
                      className="text-green-600 hover:text-green-800"
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(evaluation.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Supprimer"
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
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedEvaluation ? 'Modifier l\'évaluation' : 'Nouvelle évaluation 360°'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedEvaluation(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Employé évalué
                    </label>
                    <select
                      value={formData.employeEvalueId}
                      onChange={(e) => setFormData({ ...formData, employeEvalueId: e.target.value })}
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
                      Évaluateur
                    </label>
                    <select
                      value={formData.evaluateurId}
                      onChange={(e) => setFormData({ ...formData, evaluateurId: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                      required
                    >
                      <option value="">Sélectionner un évaluateur</option>
                      {employes.map((employe) => (
                        <option key={employe.id} value={employe.id}>
                          {employe.nom} {employe.prenom} - {employe.poste}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Type d'évaluation
                    </label>
                    <select
                      value={formData.typeEvaluation}
                      onChange={(e) => setFormData({ ...formData, typeEvaluation: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="annuelle">Annuelle</option>
                      <option value="trimestrielle">Trimestrielle</option>
                      <option value="probation">Période d'essai</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Période
                    </label>
                    <input
                      type="text"
                      value={formData.periode}
                      onChange={(e) => setFormData({ ...formData, periode: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                      placeholder="ex: 2024"
                      required
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
                      <option value="en_cours">En cours</option>
                      <option value="finalisee">Finalisée</option>
                      <option value="archivee">Archivée</option>
                    </select>
                  </div>
                </div>

                {/* Évaluation des compétences */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Évaluation des compétences</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(competencesLabels).map(([key, label]) => (
                      <div key={key} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {label}
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="range"
                            min="1"
                            max="5"
                            value={formData.competences[key]}
                            onChange={(e) => setFormData({
                              ...formData,
                              competences: {
                                ...formData.competences,
                                [key]: parseInt(e.target.value)
                              }
                            })}
                            className="flex-1"
                          />
                          <div className="flex items-center space-x-1">
                            {getScoreStars(formData.competences[key])}
                            <span className="text-sm text-gray-600 ml-2">
                              {formData.competences[key]}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Commentaires */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Objectifs
                    </label>
                    <textarea
                      value={formData.objectifs}
                      onChange={(e) => setFormData({ ...formData, objectifs: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Objectifs de l'employé..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Réalisations
                    </label>
                    <textarea
                      value={formData.realisations}
                      onChange={(e) => setFormData({ ...formData, realisations: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Principales réalisations..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Points forts
                    </label>
                    <textarea
                      value={formData.pointsForts}
                      onChange={(e) => setFormData({ ...formData, pointsForts: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Points forts identifiés..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Axes d'amélioration
                    </label>
                    <textarea
                      value={formData.axesAmelioration}
                      onChange={(e) => setFormData({ ...formData, axesAmelioration: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Axes d'amélioration identifiés..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Recommandations
                    </label>
                    <textarea
                      value={formData.recommandations}
                      onChange={(e) => setFormData({ ...formData, recommandations: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Recommandations pour l'avenir..."
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setSelectedEvaluation(null);
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

      {/* Modal de détail */}
      {showDetailModal && selectedEvaluation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Détail de l'évaluation
                </h3>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedEvaluation(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Informations générales */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Informations générales</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Employé évalué:</span>
                      <p className="font-medium">{selectedEvaluation.employeEvalueNom} {selectedEvaluation.employeEvaluePrenom}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Évaluateur:</span>
                      <p className="font-medium">{selectedEvaluation.evaluateurNom} {selectedEvaluation.evaluateurPrenom}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <p className="font-medium">{selectedEvaluation.typeEvaluation}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Période:</span>
                      <p className="font-medium">{selectedEvaluation.periode}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Statut:</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatutColor(selectedEvaluation.statut)}`}>
                        {selectedEvaluation.statut.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Score moyen:</span>
                      <div className="flex items-center space-x-2">
                        {getScoreStars(Math.round(selectedEvaluation.scoreMoyen))}
                        <span className="font-medium">{selectedEvaluation.scoreMoyen.toFixed(1)}/5</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Compétences */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Évaluation des compétences</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(competencesLabels).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">{label}</span>
                        <div className="flex items-center space-x-2">
                          {getScoreStars(selectedEvaluation.competences[key])}
                          <span className="text-sm text-gray-600">
                            {selectedEvaluation.competences[key]}/5
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Commentaires */}
                <div className="space-y-4">
                  {selectedEvaluation.objectifs && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Objectifs</h5>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {selectedEvaluation.objectifs}
                      </p>
                    </div>
                  )}

                  {selectedEvaluation.realisations && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Réalisations</h5>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {selectedEvaluation.realisations}
                      </p>
                    </div>
                  )}

                  {selectedEvaluation.pointsForts && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Points forts</h5>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {selectedEvaluation.pointsForts}
                      </p>
                    </div>
                  )}

                  {selectedEvaluation.axesAmelioration && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Axes d'amélioration</h5>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {selectedEvaluation.axesAmelioration}
                      </p>
                    </div>
                  )}

                  {selectedEvaluation.recommandations && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Recommandations</h5>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {selectedEvaluation.recommandations}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedEvaluation(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleEdit(selectedEvaluation);
                  }}
                  className="px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700"
                >
                  Modifier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Evaluations360;
