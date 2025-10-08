import React, { useState, useEffect } from 'react';
import { Search, Check, X, UserCheck } from 'lucide-react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import SignaturePad from '../components/SignaturePad';

const ValidationDG = () => {
  const { userProfile } = useAuth();
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [signature, setSignature] = useState('');
  const [commentaire, setCommentaire] = useState('');

  useEffect(() => {
    loadCommandes();
  }, []);

  const loadCommandes = async () => {
    try {
      const q = query(
        collection(db, 'commandes'),
        where('statut', '==', 'en_attente_approbation')
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

  const handleValidation = (commande) => {
    setSelectedCommande(commande);
    setSignature(commande.signatureDG || '');
    setCommentaire(commande.commentaireDG || '');
    setShowModal(true);
  };

  const handleApprove = async () => {
    if (!signature) {
      toast.error('Veuillez signer avant d\'approuver');
      return;
    }

    setLoading(true);
    try {
      await updateDoc(doc(db, 'commandes', selectedCommande.id), {
        statut: 'approuve',
        signatureDG: signature,
        commentaireDG: commentaire,
        validatedAt: new Date(),
        validatedBy: userProfile?.uid || 'system',
        validatedByName: userProfile?.nom || 'Système'
      });

      toast.success('Commande approuvée avec succès !');
      setShowModal(false);
      loadCommandes();
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
      toast.error('Erreur lors de l\'approbation');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!signature) {
      toast.error('Veuillez signer avant de rejeter');
      return;
    }

    setLoading(true);
    try {
      await updateDoc(doc(db, 'commandes', selectedCommande.id), {
        statut: 'rejete',
        signatureDG: signature,
        commentaireDG: commentaire,
        validatedAt: new Date(),
        validatedBy: userProfile?.uid || 'system',
        validatedByName: userProfile?.nom || 'Système'
      });

      toast.success('Commande rejetée');
      setShowModal(false);
      loadCommandes();
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
      toast.error('Erreur lors du rejet');
    } finally {
      setLoading(false);
    }
  };

  const filteredCommandes = commandes.filter(commande =>
    commande.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    commande.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    commande.createdByName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    commande.fournisseur?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrix = (prix) => {
    if (!prix) return 'N/A';
    return new Intl.NumberFormat('fr-FR').format(prix) + ' GNF';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Validation DG</h1>
        <p className="text-gray-600">Validez ou rejetez les commandes avec votre signature</p>
      </div>

      {/* Workflow Info */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium text-purple-900 mb-2">✍️ Votre Rôle : Validation avec Signature</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
            <span className="text-gray-600">Service</span>
          </div>
          <div className="text-gray-400">→</div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
            <span className="text-gray-600">Achat</span>
          </div>
          <div className="text-purple-400">→</div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
            <span className="text-purple-700 font-medium">Vous (DG)</span>
          </div>
        </div>
      </div>

      {/* Recherche */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Rechercher par service, description, demandeur ou fournisseur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Tableau des commandes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Commandes en attente de validation ({filteredCommandes.length})
          </h2>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement...</p>
          </div>
        ) : filteredCommandes.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune commande en attente de validation</p>
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
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    📦 Articles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fournisseur
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
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="max-w-xs">
                        <p className="line-clamp-2">{commande.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="max-w-sm">
                        {commande.articles && commande.articles.length > 0 ? (
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1 mb-2">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-purple-600 text-white">
                                {commande.articles.length} article{commande.articles.length > 1 ? 's' : ''}
                              </span>
                            </div>
                            <div className="space-y-1.5">
                              {commande.articles.slice(0, 4).map((article, index) => (
                                <div key={index} className="flex items-start space-x-2 bg-purple-50 p-2 rounded border border-purple-100">
                                  <span className="flex-shrink-0 w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                    {index + 1}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-900 truncate">
                                      {article.nom || article.designation}
                                    </p>
                                    {article.quantite && (
                                      <p className="text-xs text-gray-600">
                                        Qté: <span className="font-medium">{article.quantite}</span>
                                        {article.unite && ` ${article.unite}`}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                              {commande.articles.length > 4 && (
                                <div className="text-center py-1 px-2 bg-purple-100 rounded">
                                  <span className="text-xs text-purple-700 font-bold">
                                    + {commande.articles.length - 4} autre{commande.articles.length - 4 > 1 ? 's' : ''}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-2 px-3 bg-gray-100 rounded">
                            <p className="text-xs text-gray-500 italic">Aucun article</p>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatPrix(commande.prix)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {commande.fournisseur}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {commande.createdByName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {commande.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleValidation(commande)}
                        className="text-purple-600 hover:text-purple-900 flex items-center space-x-1"
                      >
                        <Check className="h-4 w-4" />
                        <span>Valider</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de validation */}
      {showModal && selectedCommande && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Validation de la Commande</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Détails de la commande */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <h4 className="font-medium text-gray-900 mb-3">Détails de la commande</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="mb-2"><strong>Service:</strong> {selectedCommande.service}</p>
                      <p className="mb-2"><strong>Quantité:</strong> {selectedCommande.quantite} {selectedCommande.unite}</p>
                      <p className="mb-2"><strong>Demandeur:</strong> {selectedCommande.createdByName}</p>
                    </div>
                    <div>
                      <p className="mb-2"><strong>Prix:</strong> <span className="text-green-600 font-medium">{formatPrix(selectedCommande.prix)}</span></p>
                      <p className="mb-2"><strong>Fournisseur:</strong> {selectedCommande.fournisseur}</p>
                      <p className="mb-2"><strong>Date:</strong> {selectedCommande.createdAt?.toDate?.()?.toLocaleDateString('fr-FR') || 'N/A'}</p>
                    </div>
                  </div>
                  
                  {/* Description complète */}
                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <p className="font-medium text-gray-900 mb-2">📝 Description détaillée :</p>
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedCommande.description || 'Aucune description fournie'}</p>
                    </div>
                  </div>
                  
                  {/* Articles si disponibles */}
                  {selectedCommande.articles && selectedCommande.articles.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <p className="font-medium text-gray-900 mb-3">📦 Articles demandés ({selectedCommande.articles.length}) :</p>
                      <div className="space-y-2">
                        {selectedCommande.articles.map((article, index) => (
                          <div key={index} className="bg-white p-3 rounded border border-gray-200 flex items-start space-x-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{article.nom || article.designation}</p>
                              {article.description && (
                                <p className="text-xs text-gray-600 mt-1">{article.description}</p>
                              )}
                              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                {article.quantite && (
                                  <span>Qté: <strong>{article.quantite}</strong></span>
                                )}
                                {article.unite && (
                                  <span>Unité: <strong>{article.unite}</strong></span>
                                )}
                                {article.reference && (
                                  <span>Réf: <strong>{article.reference}</strong></span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Commentaire de l'achat si disponible */}
                  {selectedCommande.commentaire && (
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <p className="font-medium text-gray-900 mb-2">💬 Commentaire du service achat :</p>
                      <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                        <p className="text-sm text-gray-700 italic">{selectedCommande.commentaire}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Commentaire */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commentaire (optionnel)
                  </label>
                  <textarea
                    value={commentaire}
                    onChange={(e) => setCommentaire(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ajoutez un commentaire sur votre décision..."
                  />
                </div>

                {/* Signature */}
                <div>
                  <SignaturePad
                    onSave={(signatureData) => {
                      setSignature(signatureData);
                      toast.success('Signature sauvegardée');
                    }}
                    onCancel={() => {
                      // Ne rien faire, garder la signature actuelle
                    }}
                    initialSignature={signature}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  onClick={handleReject}
                  disabled={loading || !signature}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="h-4 w-4 mr-2" />
                  {loading ? 'Rejet...' : 'Rejeter'}
                </button>
                <button
                  onClick={handleApprove}
                  disabled={loading || !signature}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {loading ? 'Approbation...' : 'Approuver'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationDG;
