import React, { useState, useEffect } from 'react';
import { Search, DollarSign, Save, Calendar } from 'lucide-react';
import { collection, query, where, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const ServiceAchat = () => {
  const { userProfile } = useAuth();
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [prix, setPrix] = useState('');
  const [fournisseur, setFournisseur] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [fournisseurs, setFournisseurs] = useState([]);
  const [showTodayOnly, setShowTodayOnly] = useState(false);

  useEffect(() => {
    loadCommandes();
    loadFournisseurs();
  }, []);

  const loadCommandes = async () => {
    try {
      const q = query(
        collection(db, 'commandes'),
        where('statut', '==', 'en_attente_prix')
      );
      const querySnapshot = await getDocs(q);
      const commandesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCommandes(commandesData);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
      toast.error('Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  const loadFournisseurs = async () => {
    try {
      const q = query(collection(db, 'fournisseurs'), orderBy('nom'));
      const querySnapshot = await getDocs(q);
      const fournisseursData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFournisseurs(fournisseursData);
    } catch (error) {
      console.error('Erreur lors du chargement des fournisseurs:', error);
    }
  };

  const handleAjouterPrix = (commande) => {
    setSelectedCommande(commande);
    setPrix(commande.prix || '');
    setFournisseur(commande.fournisseur || '');
    setCommentaire(commande.commentaire || '');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!prix || !fournisseur) {
      toast.error('Veuillez remplir le prix et le fournisseur');
      return;
    }

    setLoading(true);
    try {
      await updateDoc(doc(db, 'commandes', selectedCommande.id), {
        prix: parseFloat(prix),
        fournisseur: fournisseur,
        commentaire: commentaire,
        statut: 'en_attente_approbation',
        updatedAt: new Date(),
        updatedBy: userProfile?.uid || 'system',
        updatedByName: userProfile?.nom || 'Système'
      });

      toast.success('Prix ajouté avec succès !');
      setShowModal(false);
      loadCommandes();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour vérifier si une commande est créée aujourd'hui
  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    const commandeDate = date.toDate ? date.toDate() : new Date(date);
    return (
      commandeDate.getDate() === today.getDate() &&
      commandeDate.getMonth() === today.getMonth() &&
      commandeDate.getFullYear() === today.getFullYear()
    );
  };

  const filteredCommandes = commandes.filter(commande => {
    // Filtre de recherche
    const matchSearch = commande.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commande.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commande.createdByName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtre "Commandes du jour"
    const matchToday = !showTodayOnly || isToday(commande.createdAt);
    
    return matchSearch && matchToday;
  });

  // Compter les commandes du jour
  const todayCommandesCount = commandes.filter(cmd => isToday(cmd.createdAt)).length;

  const getUrgenceColor = (urgence) => {
    switch (urgence) {
      case 'critique': return 'bg-red-100 text-red-800 border-red-200';
      case 'urgente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getUrgenceIcon = (urgence) => {
    switch (urgence) {
      case 'critique': return '🔴';
      case 'urgente': return '🟡';
      default: return '🟢';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Achat</h1>
        <p className="text-gray-600">Ajoutez les prix aux commandes en attente</p>
      </div>

      {/* Workflow Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium text-yellow-900 mb-2">💰 Votre Rôle : Ajouter les Prix</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
            <span className="text-gray-600">Service</span>
          </div>
          <div className="text-yellow-400">→</div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
            <span className="text-yellow-700 font-medium">Vous (Achat)</span>
          </div>
          <div className="text-gray-400">→</div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
            <span className="text-gray-600">Directeur Général</span>
          </div>
        </div>
      </div>

      {/* Recherche et Filtres */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Rechercher par service, description ou demandeur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Bouton Commandes du jour */}
          <button
            onClick={() => setShowTodayOnly(!showTodayOnly)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
              showTodayOnly
                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Calendar size={20} />
            <span className="font-medium">Commandes du jour</span>
            {todayCommandesCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                showTodayOnly ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'
              }`}>
                {todayCommandesCount}
              </span>
            )}
          </button>
        </div>
        
        {/* Message d'information si filtre actif */}
        {showTodayOnly && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center space-x-2">
            <Calendar className="text-blue-600" size={20} />
            <p className="text-sm text-blue-700">
              Affichage des commandes créées aujourd'hui ({todayCommandesCount} commande{todayCommandesCount > 1 ? 's' : ''})
            </p>
            <button
              onClick={() => setShowTodayOnly(false)}
              className="ml-auto text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              Afficher toutes
            </button>
          </div>
        )}
      </div>

      {/* Tableau des commandes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Commandes en attente de prix ({filteredCommandes.length})
          </h2>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement...</p>
          </div>
        ) : filteredCommandes.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune commande en attente de prix</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Article
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Urgence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Demandeur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCommandes.map((commande) => (
                  <tr key={commande.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {commande.service}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs">
                        <p className="font-semibold">{commande.article || 'N/A'}</p>
                        {commande.articles && commande.articles.length > 0 && (
                          <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            📦 {commande.articles.length} article{commande.articles.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {commande.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {commande.quantite} {commande.unite}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getUrgenceColor(commande.urgence)}`}>
                        {getUrgenceIcon(commande.urgence)} {commande.urgence}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {commande.createdByName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {commande.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleAjouterPrix(commande)}
                        className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                      >
                        <DollarSign className="h-4 w-4" />
                        <span>Ajouter Prix</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal pour ajouter le prix */}
      {showModal && selectedCommande && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Ajouter le Prix</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Détails de la commande</h4>
                  <p><strong>Service:</strong> {selectedCommande.service}</p>
                  <p><strong>Description:</strong> {selectedCommande.description}</p>
                  <p><strong>Quantité:</strong> {selectedCommande.quantite} {selectedCommande.unite}</p>
                  <p><strong>Urgence:</strong> {selectedCommande.urgence}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prix en GNF *
                    </label>
                    <input
                      type="number"
                      value={prix}
                      onChange={(e) => setPrix(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 150000"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fournisseur *
                    </label>
                    <select
                      value={fournisseur}
                      onChange={(e) => setFournisseur(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Sélectionner un fournisseur</option>
                      {fournisseurs.map(fournisseur => (
                        <option key={fournisseur.id} value={fournisseur.nom}>
                          {fournisseur.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commentaire (optionnel)
                  </label>
                  <textarea
                    value={commentaire}
                    onChange={(e) => setCommentaire(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ajoutez des informations sur le fournisseur ou la commande..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading || !prix || !fournisseur}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Sauvegarde...' : 'Ajouter le prix'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceAchat;
