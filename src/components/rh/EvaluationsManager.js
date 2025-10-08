import React, { useState } from 'react';
import { Award, Star, TrendingUp, User, Calendar, FileText } from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

const EvaluationsManager = ({ evaluations, employes, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    employeId: '',
    type: 'Évaluation annuelle',
    date: new Date().toISOString().split('T')[0],
    noteGlobale: 3,
    commentaire: '',
    objectifs: '',
    notesDetaillees: {
      performance: 3,
      ponctualite: 3,
      travailEquipe: 3,
      initiative: 3,
      competencesTechniques: 3
    }
  });

  const typesEvaluation = [
    'Évaluation annuelle',
    'Évaluation trimestrielle',
    'Évaluation probatoire',
    'Évaluation de projet',
    'Évaluation de compétences'
  ];

  const criteres = [
    { key: 'performance', label: 'Performance générale' },
    { key: 'ponctualite', label: 'Ponctualité' },
    { key: 'travailEquipe', label: 'Travail d\'équipe' },
    { key: 'initiative', label: 'Initiative' },
    { key: 'competencesTechniques', label: 'Compétences techniques' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Calculer la note globale moyenne
      const notesValues = Object.values(formData.notesDetaillees);
      const moyenneNotes = notesValues.reduce((sum, note) => sum + note, 0) / notesValues.length;

      const evaluationData = {
        ...formData,
        date: new Date(formData.date),
        note: parseFloat(moyenneNotes.toFixed(1)),
        createdAt: new Date()
      };

      await addDoc(collection(db, 'evaluations'), evaluationData);
      toast.success('Évaluation enregistrée');
      
      setShowModal(false);
      resetForm();
      onRefresh();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const resetForm = () => {
    setFormData({
      employeId: '',
      type: 'Évaluation annuelle',
      date: new Date().toISOString().split('T')[0],
      noteGlobale: 3,
      commentaire: '',
      objectifs: '',
      notesDetaillees: {
        performance: 3,
        ponctualite: 3,
        travailEquipe: 3,
        initiative: 3,
        competencesTechniques: 3
      }
    });
  };

  const getEmployeName = (employeId) => {
    const employe = employes.find(e => e.id === employeId);
    return employe?.nom || 'N/A';
  };

  const getEmployePoste = (employeId) => {
    const employe = employes.find(e => e.id === employeId);
    return employe?.poste || 'N/A';
  };

  const getNoteColor = (note) => {
    if (note >= 4.5) return 'text-green-600 bg-green-100';
    if (note >= 4) return 'text-green-600 bg-green-50';
    if (note >= 3) return 'text-yellow-600 bg-yellow-50';
    if (note >= 2) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getNoteLabel = (note) => {
    if (note >= 4.5) return 'Excellent';
    if (note >= 4) return 'Très bien';
    if (note >= 3) return 'Satisfaisant';
    if (note >= 2) return 'À améliorer';
    return 'Insuffisant';
  };

  // Statistiques
  const stats = {
    totalEvaluations: evaluations.length,
    moyenneGenerale: evaluations.length > 0 
      ? (evaluations.reduce((sum, e) => sum + (e.note || 0), 0) / evaluations.length).toFixed(1)
      : 0,
    excellents: evaluations.filter(e => e.note >= 4.5).length,
    aAmeliorer: evaluations.filter(e => e.note < 3).length
  };

  // Graphique radar pour note détaillée (simplifié)
  const renderRadarChart = (notes) => {
    const max = 5;
    const criteresList = criteres.map(c => ({
      label: c.label,
      value: notes[c.key] || 0
    }));

    return (
      <div className="grid grid-cols-1 gap-2">
        {criteresList.map((critere, index) => {
          const percentage = (critere.value / max) * 100;
          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span>{critere.label}</span>
                <span className="font-medium">{critere.value.toFixed(1)}/5</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    critere.value >= 4 ? 'bg-green-500' : 
                    critere.value >= 3 ? 'bg-yellow-500' : 'bg-orange-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Évaluations de Performance</h2>
          <p className="text-gray-600">Suivez et évaluez les performances de vos employés</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Award size={20} />
          <span>Nouvelle évaluation</span>
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total évaluations</p>
            <FileText className="text-blue-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.totalEvaluations}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Moyenne générale</p>
            <Star className="text-yellow-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.moyenneGenerale}/5</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Excellents</p>
            <Award className="text-green-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.excellents}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">À améliorer</p>
            <TrendingUp className="text-orange-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-orange-600">{stats.aAmeliorer}</p>
        </div>
      </div>

      {/* Liste des évaluations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {evaluations.map(evaluation => (
          <div key={evaluation.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
            {/* En-tête de la carte */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {getEmployeName(evaluation.employeId)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {getEmployePoste(evaluation.employeId)}
                  </p>
                </div>
              </div>
              <div className={`flex flex-col items-end`}>
                <div className={`flex items-center space-x-1 px-3 py-1 rounded-full ${getNoteColor(evaluation.note)}`}>
                  <Star size={16} fill="currentColor" />
                  <span className="font-bold">{evaluation.note?.toFixed(1)}</span>
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  {getNoteLabel(evaluation.note)}
                </span>
              </div>
            </div>

            {/* Informations */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <FileText size={16} className="mr-2" />
                <span>{evaluation.type}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar size={16} className="mr-2" />
                <span>
                  {evaluation.date?.toDate?.()?.toLocaleDateString('fr-FR') || 'N/A'}
                </span>
              </div>
            </div>

            {/* Notes détaillées */}
            {evaluation.notesDetaillees && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Notes détaillées</h4>
                {renderRadarChart(evaluation.notesDetaillees)}
              </div>
            )}

            {/* Commentaire */}
            {evaluation.commentaire && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 line-clamp-3">
                  {evaluation.commentaire}
                </p>
              </div>
            )}

            {/* Objectifs */}
            {evaluation.objectifs && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-xs font-semibold text-blue-700 mb-1">Objectifs</p>
                <p className="text-sm text-blue-600 line-clamp-2">
                  {evaluation.objectifs}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {evaluations.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Award className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucune évaluation enregistrée</h3>
          <p className="text-gray-600">Commencez à évaluer les performances de vos employés</p>
        </div>
      )}

      {/* Modal d'évaluation */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Nouvelle évaluation</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <option key={emp.id} value={emp.id}>{emp.nom} - {emp.poste}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type d'évaluation *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {typesEvaluation.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
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

              {/* Notes détaillées */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Évaluation par critère * (1 à 5)
                </label>
                <div className="space-y-3">
                  {criteres.map(critere => (
                    <div key={critere.key} className="flex items-center justify-between">
                      <label className="text-sm text-gray-700">{critere.label}</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="0.5"
                          value={formData.notesDetaillees[critere.key]}
                          onChange={(e) => setFormData({
                            ...formData,
                            notesDetaillees: {
                              ...formData.notesDetaillees,
                              [critere.key]: parseFloat(e.target.value)
                            }
                          })}
                          className="w-40"
                        />
                        <span className="w-12 text-center text-sm font-medium text-gray-800">
                          {formData.notesDetaillees[critere.key].toFixed(1)}
                        </span>
                        <div className="flex space-x-0.5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              size={16}
                              className={star <= formData.notesDetaillees[critere.key] ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Commentaire général
                </label>
                <textarea
                  value={formData.commentaire}
                  onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Points forts, points à améliorer..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Objectifs pour la période suivante
                </label>
                <textarea
                  value={formData.objectifs}
                  onChange={(e) => setFormData({ ...formData, objectifs: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Objectifs à atteindre..."
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

export default EvaluationsManager;

