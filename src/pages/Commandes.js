import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Check, 
  X,
  DollarSign,
  UserCheck
} from 'lucide-react';
import { collection, query, orderBy, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import SignaturePad from '../components/SignaturePad';

const Commandes = () => {
  const { userProfile } = useAuth();
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('tous');
  const [showModal, setShowModal] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadCommandes();
  }, []);

  const loadCommandes = async () => {
    try {
      const commandesQuery = collection(db, 'commandes');
      const snapshot = await getDocs(commandesQuery);
      const commandesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Trier côté client pour éviter l'erreur d'index
      commandesData.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA; // Tri décroissant
      });
      setCommandes(commandesData);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
      toast.error('Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };


  const filteredCommandes = commandes.filter(commande => {
    const matchesSearch = commande.article?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         commande.service?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatut === 'tous' || commande.statut === filterStatut;
    return matchesSearch && matchesFilter;
  });

  // Fonction getStatutInfo supprimée car non utilisée

  const canEdit = (commande) => {
    if (userProfile.role === 'service') {
      return commande.statut === 'en_attente_prix' && commande.createdBy === userProfile.id;
    }
    if (userProfile.role === 'achat') {
      return commande.statut === 'en_attente_prix';
    }
    if (userProfile.role === 'dg') {
      return commande.statut === 'en_attente_approbation';
    }
    return false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Commandes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Suivez et gérez toutes les commandes de votre organisation
          </p>
        </div>
        {userProfile.role === 'service' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouvelle commande
          </button>
        )}
      </div>

      {/* Workflow des commandes */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Workflow des Commandes</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">1</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">Service</p>
              <p className="text-xs text-blue-700">Crée la commande</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">2</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-900">Achat</p>
              <p className="text-xs text-yellow-700">Ajoute le prix</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">3</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-purple-900">DG</p>
              <p className="text-xs text-purple-700">Valide avec signature</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="h-4 w-4 text-white" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-green-900">Finalisé</p>
              <p className="text-xs text-green-700">Commande approuvée</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions selon le rôle */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Actions Disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {userProfile.role === 'service' && (
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <Plus className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-blue-900">Créer une commande</p>
                <p className="text-xs text-blue-700">Démarrez le processus de commande</p>
              </div>
            </div>
          )}
          
          {userProfile.role === 'achat' && (
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <DollarSign className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-yellow-900">Ajouter des prix</p>
                <p className="text-xs text-yellow-700">Attribuez des prix aux commandes en attente</p>
              </div>
            </div>
          )}
          
          {userProfile.role === 'dg' && (
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <UserCheck className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-purple-900">Valider les commandes</p>
                <p className="text-xs text-purple-700">Approuvez ou rejetez avec votre signature</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher par article ou service..."
                className="form-input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              className="form-input"
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
            >
              <option value="tous">Tous les statuts</option>
              <option value="en_attente">En attente de prix</option>
              <option value="en_attente_approbation">En attente d'approbation</option>
              <option value="en_cours">En cours</option>
              <option value="approuve">Approuvé</option>
              <option value="rejete">Rejeté</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau des commandes */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Groupe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Article
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Prix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Signature
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCommandes.map((commande) => (
                <tr key={commande.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                    {commande.groupeCommande ? (
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Groupe
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          {commande.groupeCommande.split('_')[2]}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {commande.article}
                    </div>
                    <div className="text-sm text-gray-500">
                      {commande.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">
                    {commande.service}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {commande.quantite}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                    {commande.prix ? `${commande.prix} GNF` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      commande.statut === 'en_attente_prix' ? 'bg-yellow-100 text-yellow-800' :
                      commande.statut === 'prix_ajoute' ? 'bg-blue-100 text-blue-800' :
                      commande.statut === 'valide' ? 'bg-green-100 text-green-800' :
                      commande.statut === 'rejete' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {commande.statut === 'en_attente_prix' ? 'En attente prix' :
                       commande.statut === 'prix_ajoute' ? 'Prix ajouté' :
                       commande.statut === 'valide' ? 'Validé' :
                       commande.statut === 'rejete' ? 'Rejeté' :
                       commande.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                    {commande.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                    {commande.signatureDG ? (
                      <img 
                        src={commande.signatureDG} 
                        alt="Signature DG" 
                        className="w-16 h-8 object-contain border border-gray-300 rounded"
                      />
                    ) : (
                      <span className="text-gray-400">Non signée</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-col space-y-1">
                      <button
                        onClick={() => {
                          setSelectedCommande(commande);
                          setShowModal(true);
                        }}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
                        title="Voir détails"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Voir
                      </button>
                      
                      {/* Actions spécifiques selon le rôle et le statut */}
                      {userProfile.role === 'achat' && commande.statut === 'en_attente_prix' && (
                        <button
                          onClick={() => {
                            setSelectedCommande(commande);
                            setShowModal(true);
                          }}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-yellow-600 bg-yellow-50 rounded hover:bg-yellow-100"
                          title="Ajouter le prix"
                        >
                          <DollarSign className="h-3 w-3 mr-1" />
                          Ajouter Prix
                        </button>
                      )}
                      
                      {userProfile.role === 'dg' && commande.statut === 'en_attente_approbation' && (
                        <button
                          onClick={() => {
                            setSelectedCommande(commande);
                            setShowModal(true);
                          }}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-purple-600 bg-purple-50 rounded hover:bg-purple-100"
                          title="Valider ou rejeter"
                        >
                          <UserCheck className="h-3 w-3 mr-1" />
                          Valider
                        </button>
                      )}
                      
                      {canEdit(commande) && (
                        <button
                          onClick={() => {
                            setSelectedCommande(commande);
                            setShowModal(true);
                          }}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 bg-gray-50 rounded hover:bg-gray-100"
                          title="Modifier"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Modifier
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de détails/modification */}
      {showModal && selectedCommande && (
        <CommandeModal
          commande={selectedCommande}
          onClose={() => {
            setShowModal(false);
            setSelectedCommande(null);
          }}
          onSave={loadCommandes}
          userProfile={userProfile}
        />
      )}

      {/* Modal de création */}
      {showCreateModal && (
        <CreateCommandeModal
          onClose={() => setShowCreateModal(false)}
          onSave={loadCommandes}
          userProfile={userProfile}
        />
      )}
    </div>
  );
};

// Composant Modal pour les détails/modification
const CommandeModal = ({ commande, onClose, onSave, userProfile }) => {
  const [prix, setPrix] = useState(commande.prix || '');
  const [commentaire, setCommentaire] = useState(commande.commentaire || '');
  const [loading, setLoading] = useState(false);
  const [signature, setSignature] = useState(commande.signatureDG || '');

  const handleSave = async () => {
    setLoading(true);
    try {
      if (userProfile.role === 'achat' && prix) {
        await updateDoc(doc(db, 'commandes', commande.id), {
          prix: parseFloat(prix),
          statut: 'en_attente_approbation',
          dateAjoutPrix: new Date(),
          prixAjoutePar: userProfile.id
        });
        toast.success('Prix ajouté avec succès');
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'commandes', commande.id), {
        statut: 'approuve',
        dateApprobation: new Date(),
        approuvePar: userProfile.id,
        signatureDG: signature || userProfile.nom + ' ' + userProfile.prenom,
        commentaireDG: commentaire
      });
      toast.success('Commande approuvée avec succès');
      onSave();
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
      toast.error('Erreur lors de l\'approbation');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'commandes', commande.id), {
        statut: 'rejete',
        dateRejet: new Date(),
        rejetePar: userProfile.id,
        commentaireRejet: commentaire
      });
      toast.success('Commande rejetée');
      onSave();
      onClose();
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
      toast.error('Erreur lors du rejet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Détails de la commande
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="form-label">Article</label>
              <input
                type="text"
                className="form-input"
                value={commande.article}
                disabled
              />
            </div>
            
            <div>
              <label className="form-label">Service</label>
              <input
                type="text"
                className="form-input"
                value={commande.service}
                disabled
              />
            </div>
            
            <div>
              <label className="form-label">Quantité</label>
              <input
                type="number"
                className="form-input"
                value={commande.quantite}
                disabled
              />
            </div>
            
            {userProfile.role === 'achat' && !commande.prix && (
              <div>
                <label className="form-label">Prix (GNF)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={prix}
                  onChange={(e) => setPrix(e.target.value)}
                  placeholder="Entrez le prix"
                />
              </div>
            )}
            
            {commande.prix && (
              <div>
                <label className="form-label">Prix</label>
                <input
                  type="text"
                  className="form-input"
                  value={`${commande.prix} GNF`}
                  disabled
                />
              </div>
            )}
            
            {userProfile.role === 'dg' && (
              <>
                <div>
                  <label className="form-label">Commentaire (optionnel)</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    value={commentaire}
                    onChange={(e) => setCommentaire(e.target.value)}
                    placeholder="Ajoutez un commentaire..."
                  />
                </div>
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
              </>
            )}
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="btn btn-secondary"
            >
              Annuler
            </button>
            
            {userProfile.role === 'achat' && !commande.prix && prix && (
              <button
                onClick={handleSave}
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Sauvegarde...' : 'Ajouter le prix'}
              </button>
            )}
            
            {userProfile.role === 'dg' && commande.statut === 'en_attente_approbation' && (
              <>
                <button
                  onClick={handleReject}
                  disabled={loading}
                  className="btn btn-danger"
                >
                  <X className="h-4 w-4 mr-2" />
                  {loading ? 'Rejet...' : 'Rejeter'}
                </button>
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="btn btn-success"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {loading ? 'Approbation...' : 'Approuver'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant Modal pour la création
const CreateCommandeModal = ({ onClose, onSave, userProfile }) => {
  const [formData, setFormData] = useState({
    article: '',
    description: '',
    quantite: '',
    unite: 'unité',
    service: userProfile.service || '',
    urgence: 'normale'
  });
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const servicesQuery = query(collection(db, 'services'), orderBy('nom'));
      const snapshot = await getDocs(servicesQuery);
      const servicesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setServices(servicesData);
    } catch (error) {
      console.error('Erreur lors du chargement des services:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await addDoc(collection(db, 'commandes'), {
        ...formData,
        quantite: parseInt(formData.quantite),
        statut: 'en_attente_prix',
        createdBy: userProfile.id,
        createdAt: new Date()
      });
      toast.success('Commande créée avec succès');
      onSave();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast.error('Erreur lors de la création de la commande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Nouvelle commande
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Article *</label>
              <input
                type="text"
                className="form-input"
                value={formData.article}
                onChange={(e) => setFormData({...formData, article: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            
            <div>
              <label className="form-label">Quantité *</label>
              <input
                type="number"
                className="form-input"
                value={formData.quantite}
                onChange={(e) => setFormData({...formData, quantite: e.target.value})}
                required
                min="1"
              />
            </div>
            
            <div>
              <label className="form-label">Unité de mesure *</label>
              <select
                className="form-input"
                value={formData.unite}
                onChange={(e) => setFormData({...formData, unite: e.target.value})}
                required
              >
                <option value="unité">Unité</option>
                <option value="kg">Kilogramme (kg)</option>
                <option value="g">Gramme (g)</option>
                <option value="L">Litre (L)</option>
                <option value="mL">Millilitre (mL)</option>
                <option value="m">Mètre (m)</option>
                <option value="cm">Centimètre (cm)</option>
                <option value="paquet">Paquet</option>
                <option value="carton">Carton</option>
                <option value="boîte">Boîte</option>
                <option value="pièce">Pièce</option>
                <option value="lot">Lot</option>
                <option value="set">Set</option>
              </select>
            </div>
            
            <div>
              <label className="form-label">Service *</label>
              <select
                className="form-input"
                value={formData.service}
                onChange={(e) => setFormData({...formData, service: e.target.value})}
                required
              >
                <option value="">Sélectionner un service</option>
                {services.map(service => (
                  <option key={service.id} value={service.nom}>
                    {service.nom}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="form-label">Urgence</label>
              <select
                className="form-input"
                value={formData.urgence}
                onChange={(e) => setFormData({...formData, urgence: e.target.value})}
              >
                <option value="normale">Normale</option>
                <option value="urgente">Urgente</option>
                <option value="critique">Critique</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Création...' : 'Créer la commande'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Commandes;
