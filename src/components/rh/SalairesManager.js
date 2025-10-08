import React, { useState } from 'react';
import { DollarSign, TrendingUp, Calendar, User, Download, CheckCircle } from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

const SalairesManager = ({ salaires, employes, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [filterMois, setFilterMois] = useState('tous');
  const [formData, setFormData] = useState({
    employeId: '',
    mois: new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' }),
    salaireBase: '',
    primes: 0,
    deductions: 0,
    methodePaiement: 'Virement',
    statut: 'paye'
  });

  const methodesPaiement = ['Virement', 'Espèces', 'Chèque', 'Mobile Money'];

  // Calculer les statistiques
  const stats = {
    totalMois: salaires
      .filter(s => filterMois === 'tous' || s.mois === filterMois)
      .reduce((sum, s) => sum + (s.salaireNet || 0), 0),
    nombrePaiements: salaires.filter(s => filterMois === 'tous' || s.mois === filterMois).length,
    moyenneSalaire: salaires.length > 0 
      ? salaires.reduce((sum, s) => sum + (s.salaireNet || 0), 0) / salaires.length 
      : 0
  };

  // Liste des mois disponibles
  const moisDisponibles = ['tous', ...new Set(salaires.map(s => s.mois))];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const salaireNet = parseFloat(formData.salaireBase) + 
                        parseFloat(formData.primes) - 
                        parseFloat(formData.deductions);

      const salaireData = {
        ...formData,
        salaireBase: parseFloat(formData.salaireBase),
        primes: parseFloat(formData.primes),
        deductions: parseFloat(formData.deductions),
        salaireNet,
        datePaiement: new Date(),
        createdAt: new Date()
      };

      await addDoc(collection(db, 'salaires'), salaireData);
      toast.success('Salaire enregistré');
      
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
      mois: new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' }),
      salaireBase: '',
      primes: 0,
      deductions: 0,
      methodePaiement: 'Virement',
      statut: 'paye'
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

  const filteredSalaires = salaires.filter(s => 
    filterMois === 'tous' || s.mois === filterMois
  );

  // Générer bulletin de paie (simulé)
  const generateBulletin = (salaire) => {
    toast.success('Bulletin de paie généré (fonctionnalité simulée)');
    console.log('Bulletin pour:', salaire);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestion des Salaires</h2>
          <p className="text-gray-600">Suivez et gérez la paie de vos employés</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <DollarSign size={20} />
          <span>Nouveau paiement</span>
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-100">Masse salariale</p>
            <DollarSign size={24} />
          </div>
          <p className="text-3xl font-bold">{stats.totalMois.toLocaleString()} GNF</p>
          <p className="text-sm text-blue-100 mt-1">
            {filterMois === 'tous' ? 'Total général' : filterMois}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-green-100">Paiements effectués</p>
            <CheckCircle size={24} />
          </div>
          <p className="text-3xl font-bold">{stats.nombrePaiements}</p>
          <p className="text-sm text-green-100 mt-1">
            {filterMois === 'tous' ? 'Total' : filterMois}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-purple-100">Salaire moyen</p>
            <TrendingUp size={24} />
          </div>
          <p className="text-3xl font-bold">{Math.round(stats.moyenneSalaire).toLocaleString()} GNF</p>
          <p className="text-sm text-purple-100 mt-1">Par employé</p>
        </div>
      </div>

      {/* Filtre par mois */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center space-x-2 overflow-x-auto">
          <Calendar className="text-gray-400 flex-shrink-0" size={20} />
          <div className="flex space-x-2">
            {moisDisponibles.map(mois => (
              <button
                key={mois}
                onClick={() => setFilterMois(mois)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                  filterMois === mois
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {mois === 'tous' ? 'Tous' : mois}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Liste des salaires */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employé</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mois</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Salaire base</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Primes</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Déductions</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Salaire net</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paiement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSalaires.map(salaire => (
                <tr key={salaire.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <User className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {getEmployeName(salaire.employeId)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getEmployePoste(salaire.employeId)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {salaire.mois}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-800 font-medium">
                    {(salaire.salaireBase || 0).toLocaleString()} GNF
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-green-600">
                    +{(salaire.primes || 0).toLocaleString()} GNF
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-red-600">
                    -{(salaire.deductions || 0).toLocaleString()} GNF
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <span className="font-bold text-gray-800">
                      {(salaire.salaireNet || 0).toLocaleString()} GNF
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {salaire.methodePaiement}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => generateBulletin(salaire)}
                      className="text-blue-600 hover:text-blue-700"
                      title="Télécharger bulletin"
                    >
                      <Download size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSalaires.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucun salaire enregistré</h3>
            <p className="text-gray-600">
              {filterMois === 'tous' 
                ? 'Aucun paiement de salaire enregistré'
                : `Aucun paiement pour ${filterMois}`
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal de paiement */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Enregistrer un paiement</h3>
            
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
                    <option key={emp.id} value={emp.id}>
                      {emp.nom} - {emp.poste} ({emp.salaire} GNF)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mois *
                </label>
                <input
                  type="text"
                  value={formData.mois}
                  onChange={(e) => setFormData({ ...formData, mois: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ex: janvier 2024"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salaire de base (GNF) *
                </label>
                <input
                  type="number"
                  value={formData.salaireBase}
                  onChange={(e) => setFormData({ ...formData, salaireBase: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5000000"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primes (GNF)
                  </label>
                  <input
                    type="number"
                    value={formData.primes}
                    onChange={(e) => setFormData({ ...formData, primes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Déductions (GNF)
                  </label>
                  <input
                    type="number"
                    value={formData.deductions}
                    onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salaire net calculé
                </label>
                <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-lg font-bold text-gray-800">
                    {(
                      parseFloat(formData.salaireBase || 0) + 
                      parseFloat(formData.primes || 0) - 
                      parseFloat(formData.deductions || 0)
                    ).toLocaleString()} GNF
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Méthode de paiement *
                </label>
                <select
                  value={formData.methodePaiement}
                  onChange={(e) => setFormData({ ...formData, methodePaiement: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {methodesPaiement.map(methode => (
                    <option key={methode} value={methode}>{methode}</option>
                  ))}
                </select>
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

export default SalairesManager;

