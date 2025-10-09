import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, AlertTriangle, 
  Plus, Edit2, Trash2, Calendar, Building, PieChart,
  CheckCircle, XCircle, Activity
} from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [services, setServices] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [periode, setPeriode] = useState('annuel');
  const [formData, setFormData] = useState({
    service: '',
    montantTotal: '',
    periode: 'mensuel',
    annee: new Date().getFullYear(),
    mois: new Date().getMonth() + 1,
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [budgetsSnap, servicesSnap, commandesSnap] = await Promise.all([
        getDocs(collection(db, 'budgets')),
        getDocs(collection(db, 'services')),
        getDocs(collection(db, 'commandes'))
      ]);

      setBudgets(budgetsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setServices(servicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setCommandes(commandesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Erreur chargement:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Calculer les dépenses par service
  const calculateDepenses = (serviceNom, budgetPeriode = 'mensuel', annee, mois) => {
    return commandes
      .filter(cmd => {
        if (cmd.service !== serviceNom || cmd.statut !== 'approuve') return false;
        
        const cmdDate = cmd.createdAt?.toDate?.();
        if (!cmdDate) return false;
        
        if (budgetPeriode === 'mensuel') {
          return cmdDate.getFullYear() === annee && cmdDate.getMonth() + 1 === mois;
        } else if (budgetPeriode === 'annuel') {
          return cmdDate.getFullYear() === annee;
        }
        return false;
      })
      .reduce((sum, cmd) => sum + (cmd.prix || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const budgetData = {
        ...formData,
        montantTotal: parseFloat(formData.montantTotal),
        annee: parseInt(formData.annee),
        mois: parseInt(formData.mois),
        createdAt: selectedBudget ? selectedBudget.createdAt : new Date(),
        updatedAt: new Date()
      };

      if (selectedBudget) {
        await updateDoc(doc(db, 'budgets', selectedBudget.id), budgetData);
        toast.success('Budget modifié avec succès');
      } else {
        await addDoc(collection(db, 'budgets'), budgetData);
        toast.success('Budget créé avec succès');
      }

      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (budgetId) => {
    if (window.confirm('Confirmer la suppression de ce budget ?')) {
      try {
        await deleteDoc(doc(db, 'budgets', budgetId));
        toast.success('Budget supprimé');
        loadData();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const openModal = (budget = null) => {
    if (budget) {
      setSelectedBudget(budget);
      setFormData({
        service: budget.service,
        montantTotal: budget.montantTotal,
        periode: budget.periode,
        annee: budget.annee,
        mois: budget.mois,
        description: budget.description || ''
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      service: '',
      montantTotal: '',
      periode: 'mensuel',
      annee: new Date().getFullYear(),
      mois: new Date().getMonth() + 1,
      description: ''
    });
    setSelectedBudget(null);
  };

  // Calculer les statistiques globales
  const stats = {
    totalBudget: budgets.reduce((sum, b) => sum + (b.montantTotal || 0), 0),
    totalDepense: budgets.reduce((sum, b) => {
      const depense = calculateDepenses(b.service, b.periode, b.annee, b.mois);
      return sum + depense;
    }, 0),
    budgetsDepasses: budgets.filter(b => {
      const depense = calculateDepenses(b.service, b.periode, b.annee, b.mois);
      return depense > b.montantTotal;
    }).length,
    budgetsSains: budgets.filter(b => {
      const depense = calculateDepenses(b.service, b.periode, b.annee, b.mois);
      const utilisation = (depense / b.montantTotal) * 100;
      return utilisation <= 80;
    }).length
  };

  const tauxUtilisation = stats.totalBudget > 0 
    ? ((stats.totalDepense / stats.totalBudget) * 100).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Chargement des budgets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💰 Gestion des Budgets</h1>
          <p className="text-gray-600">Gérez et suivez les budgets par service</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
        >
          <Plus size={20} />
          <span>Nouveau budget</span>
        </button>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-100 text-sm font-medium">Budget Total</p>
            <DollarSign size={24} />
          </div>
          <p className="text-3xl font-bold">{new Intl.NumberFormat('fr-FR').format(stats.totalBudget)} GNF</p>
          <p className="text-blue-100 text-xs mt-2">{budgets.length} budget(s) actif(s)</p>
        </div>

        <div className={`bg-gradient-to-br ${
          stats.totalDepense > stats.totalBudget ? 'from-red-500 to-red-600' : 'from-green-500 to-green-600'
        } rounded-xl shadow-lg p-6 text-white`}>
          <div className="flex items-center justify-between mb-2">
            <p className={`${stats.totalDepense > stats.totalBudget ? 'text-red-100' : 'text-green-100'} text-sm font-medium`}>
              Dépenses
            </p>
            {stats.totalDepense > stats.totalBudget ? <TrendingDown size={24} /> : <TrendingUp size={24} />}
          </div>
          <p className="text-3xl font-bold">{new Intl.NumberFormat('fr-FR').format(stats.totalDepense)} GNF</p>
          <p className={`${stats.totalDepense > stats.totalBudget ? 'text-red-100' : 'text-green-100'} text-xs mt-2`}>
            {tauxUtilisation}% utilisé
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-orange-100 text-sm font-medium">Budgets dépassés</p>
            <AlertTriangle size={24} />
          </div>
          <p className="text-3xl font-bold">{stats.budgetsDepasses}</p>
          <p className="text-orange-100 text-xs mt-2">Alerte dépassement</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-green-100 text-sm font-medium">Budgets sains</p>
            <CheckCircle size={24} />
          </div>
          <p className="text-3xl font-bold">{stats.budgetsSains}</p>
          <p className="text-green-100 text-xs mt-2">{'<'} 80% utilisé</p>
        </div>
      </div>

      {/* Liste des budgets */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">📊 Budgets par Service</h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {budgets.map(budget => {
              const depense = calculateDepenses(budget.service, budget.periode, budget.annee, budget.mois);
              const reste = budget.montantTotal - depense;
              const pourcentage = budget.montantTotal > 0 ? (depense / budget.montantTotal) * 100 : 0;
              const depassement = depense > budget.montantTotal;

              return (
                <div key={budget.id} className={`p-6 rounded-xl border-2 ${
                  depassement ? 'border-red-300 bg-red-50' : 
                  pourcentage > 80 ? 'border-orange-300 bg-orange-50' :
                  'border-green-300 bg-green-50'
                }`}>
                  {/* En-tête */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        depassement ? 'bg-red-200 text-red-600' :
                        pourcentage > 80 ? 'bg-orange-200 text-orange-600' :
                        'bg-green-200 text-green-600'
                      }`}>
                        <Building size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{budget.service}</h3>
                        <p className="text-xs text-gray-600">
                          {budget.periode === 'mensuel' 
                            ? `${budget.mois}/${budget.annee}` 
                            : `Année ${budget.annee}`
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModal(budget)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(budget.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Montants */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-600">Budget</p>
                      <p className="text-sm font-bold text-gray-900">
                        {new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format(budget.montantTotal)} GNF
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Dépensé</p>
                      <p className={`text-sm font-bold ${depassement ? 'text-red-600' : 'text-gray-900'}`}>
                        {new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format(depense)} GNF
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Reste</p>
                      <p className={`text-sm font-bold ${depassement ? 'text-red-600' : reste < budget.montantTotal * 0.2 ? 'text-orange-600' : 'text-green-600'}`}>
                        {new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format(Math.abs(reste))} GNF
                      </p>
                    </div>
                  </div>

                  {/* Barre de progression */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Utilisation</span>
                      <span className={`font-bold ${
                        depassement ? 'text-red-600' :
                        pourcentage > 80 ? 'text-orange-600' :
                        'text-green-600'
                      }`}>
                        {pourcentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          depassement ? 'bg-red-600' :
                          pourcentage > 80 ? 'bg-orange-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(pourcentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Alerte si dépassement */}
                  {depassement && (
                    <div className="mt-4 flex items-center space-x-2 p-3 bg-red-100 rounded-lg border border-red-300">
                      <AlertTriangle className="text-red-600 flex-shrink-0" size={18} />
                      <p className="text-xs text-red-700 font-medium">
                        Dépassement de {new Intl.NumberFormat('fr-FR').format(Math.abs(reste))} GNF
                      </p>
                    </div>
                  )}

                  {/* Alerte si proche */}
                  {!depassement && pourcentage > 80 && (
                    <div className="mt-4 flex items-center space-x-2 p-3 bg-orange-100 rounded-lg border border-orange-300">
                      <AlertTriangle className="text-orange-600 flex-shrink-0" size={18} />
                      <p className="text-xs text-orange-700 font-medium">
                        Attention : {(100 - pourcentage).toFixed(1)}% restant
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {budgets.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucun budget défini</h3>
              <p className="text-gray-600 mb-4">Commencez par créer un budget pour un service</p>
              <button
                onClick={() => openModal()}
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                <Plus size={20} />
                <span>Créer mon premier budget</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de création/modification */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              {selectedBudget ? 'Modifier' : 'Nouveau'} budget
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service *
                </label>
                <select
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionner un service</option>
                  {services.map(s => (
                    <option key={s.id} value={s.nom}>{s.nom}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant du budget (GNF) *
                </label>
                <input
                  type="number"
                  value={formData.montantTotal}
                  onChange={(e) => setFormData({ ...formData, montantTotal: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10000000"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Période *
                  </label>
                  <select
                    value={formData.periode}
                    onChange={(e) => setFormData({ ...formData, periode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="mensuel">Mensuel</option>
                    <option value="annuel">Annuel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Année *
                  </label>
                  <input
                    type="number"
                    value={formData.annee}
                    onChange={(e) => setFormData({ ...formData, annee: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {formData.periode === 'mensuel' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mois *
                  </label>
                  <select
                    value={formData.mois}
                    onChange={(e) => setFormData({ ...formData, mois: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                      <option key={m} value={m}>
                        {new Date(2000, m - 1).toLocaleDateString('fr-FR', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Objectifs budgétaires..."
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
                  {selectedBudget ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;

