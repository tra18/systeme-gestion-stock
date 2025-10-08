import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  AlertTriangle,
  Package,
  TrendingDown,
  Minus,
  User
} from 'lucide-react';
import { collection, query, orderBy, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import SignaturePad from '../components/SignaturePad';

const Stock = () => {
  const { userProfile } = useAuth();
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('tous');
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSortieModal, setShowSortieModal] = useState(false);
  const [selectedStockItem, setSelectedStockItem] = useState(null);
  const [employes, setEmployes] = useState([]);

  useEffect(() => {
    loadStock();
    loadEmployes();
  }, []);

  const loadStock = async () => {
    try {
      const stockQuery = collection(db, 'stock');
      const snapshot = await getDocs(stockQuery);
      const stockData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Trier côté client pour éviter l'erreur d'index
      stockData.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA; // Tri décroissant
      });
      setStock(stockData);
    } catch (error) {
      console.error('Erreur lors du chargement du stock:', error);
      toast.error('Erreur lors du chargement du stock');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployes = async () => {
    try {
      console.log('Début du chargement des employés...');
      const employesQuery = collection(db, 'employes');
      const snapshot = await getDocs(employesQuery);
      console.log('Snapshot des employés:', snapshot);
      console.log('Nombre de documents:', snapshot.docs.length);
      
      const employesData = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Document employé:', doc.id, data);
        return { id: doc.id, ...data };
      });
      
      console.log('Employés chargés:', employesData);
      setEmployes(employesData);
      
      if (employesData.length === 0) {
        console.warn('Aucun employé trouvé dans la collection');
        toast.error('Aucun employé trouvé. Veuillez d\'abord créer des employés dans la page "Employés".');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
      toast.error('Erreur lors du chargement des employés: ' + error.message);
    }
  };

  const handleSortieStock = async (item) => {
    setSelectedStockItem(item);
    setShowSortieModal(true);
    // Recharger les employés à chaque ouverture du modal
    await loadEmployes();
  };

  const handleSortieSubmit = async (sortieData) => {
    try {
      const { quantiteSortie, dateSortie, employeId, signature } = sortieData;
      const quantiteSortieNum = parseInt(quantiteSortie);
      
      if (quantiteSortieNum > selectedStockItem.quantite) {
        toast.error('La quantité à sortir ne peut pas dépasser la quantité disponible');
        return;
      }

      // Calculer la nouvelle quantité
      const nouvelleQuantite = selectedStockItem.quantite - quantiteSortieNum;

      // Mettre à jour le stock
      await updateDoc(doc(db, 'stock', selectedStockItem.id), {
        quantite: nouvelleQuantite
      });

      // Créer un enregistrement de sortie
      await addDoc(collection(db, 'sorties_stock'), {
        stockId: selectedStockItem.id,
        nomArticle: selectedStockItem.nom,
        quantiteSortie: quantiteSortieNum,
        dateSortie: new Date(dateSortie),
        employeId: employeId,
        employeNom: employes.find(emp => emp.id === employeId)?.nom || 'Inconnu',
        signature: signature,
        createdAt: new Date(),
        createdBy: userProfile?.uid || 'system',
        createdByName: userProfile?.nom || 'Système'
      });

      toast.success('Sortie de stock enregistrée avec succès');
      setShowSortieModal(false);
      setSelectedStockItem(null);
      loadStock(); // Recharger le stock
    } catch (error) {
      console.error('Erreur lors de la sortie de stock:', error);
      toast.error('Erreur lors de la sortie de stock');
    }
  };

  const getStockStatus = (quantite, seuilMinimum) => {
    if (quantite <= 0) return 'rupture';
    if (quantite <= seuilMinimum) return 'faible';
    return 'normal';
  };

  const getStockColor = (status) => {
    switch (status) {
      case 'rupture': return 'text-danger-600 bg-danger-50';
      case 'faible': return 'text-warning-600 bg-warning-50';
      case 'normal': return 'text-success-600 bg-success-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStockText = (status) => {
    switch (status) {
      case 'rupture': return 'Rupture de stock';
      case 'faible': return 'Stock faible';
      case 'normal': return 'Stock normal';
      default: return status;
    }
  };

  const filteredStock = stock.filter(item => {
    const matchesSearch = item.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.categorie?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatut === 'tous' || getStockStatus(item.quantite, item.seuilMinimum) === filterStatut;
    return matchesSearch && matchesFilter;
  });

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
          <h1 className="text-2xl font-bold text-gray-900">Gestion du Stock</h1>
          <p className="mt-1 text-sm text-gray-500">
            Suivez et gérez votre inventaire
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Ajouter un article
        </button>
      </div>

      {/* Alertes de stock */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stock.filter(item => getStockStatus(item.quantite, item.seuilMinimum) === 'rupture').slice(0, 3).map((item) => (
          <div key={item.id} className="card border-l-4 border-danger-500">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-danger-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-danger-800">Rupture de stock</p>
                <p className="text-sm text-danger-600">{item.nom}</p>
                <p className="text-xs text-danger-500">Référence: {item.reference}</p>
              </div>
            </div>
          </div>
        ))}
        
        {stock.filter(item => getStockStatus(item.quantite, item.seuilMinimum) === 'faible').slice(0, 3).map((item) => (
          <div key={item.id} className="card border-l-4 border-warning-500">
            <div className="flex items-center">
              <TrendingDown className="h-5 w-5 text-warning-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-warning-800">Stock faible</p>
                <p className="text-sm text-warning-600">{item.nom}</p>
                <p className="text-xs text-warning-500">Quantité: {item.quantite} (seuil: {item.seuilMinimum})</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtres et recherche */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher un article..."
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
              <option value="normal">Stock normal</option>
              <option value="faible">Stock faible</option>
              <option value="rupture">Rupture de stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau du stock */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Article
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Référence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Seuil minimum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Prix unitaire (GNF)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStock.map((item) => {
                const stockStatus = getStockStatus(item.quantite, item.seuilMinimum);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.nom}</div>
                          <div className="text-sm text-gray-500">{item.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">
                      {item.reference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                      {item.categorie}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.quantite}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                      {item.seuilMinimum}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockColor(stockStatus)}`}>
                        {getStockText(stockStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden lg:table-cell">
                      {item.prixUnitaire ? `${item.prixUnitaire} GNF` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setShowModal(true);
                          }}
                          className="text-primary-600 hover:text-primary-900"
                          title="Voir détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setShowModal(true);
                          }}
                          className="text-warning-600 hover:text-warning-900"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleSortieStock(item)}
                          className="text-red-600 hover:text-red-900"
                          title="Sortie de stock"
                          disabled={item.quantite <= 0}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de détails/modification */}
      {showModal && selectedItem && (
        <StockModal
          item={selectedItem}
          onClose={() => {
            setShowModal(false);
            setSelectedItem(null);
          }}
          onSave={loadStock}
          userProfile={userProfile}
        />
      )}

      {/* Modal de création */}
      {showCreateModal && (
        <CreateStockModal
          onClose={() => setShowCreateModal(false)}
          onSave={loadStock}
          userProfile={userProfile}
        />
      )}

      {/* Modal de sortie de stock */}
      {showSortieModal && selectedStockItem && (
        <SortieStockModal
          item={selectedStockItem}
          employes={employes}
          onClose={() => {
            setShowSortieModal(false);
            setSelectedStockItem(null);
          }}
          onSave={handleSortieSubmit}
        />
      )}
    </div>
  );
};

// Composant Modal pour les détails/modification du stock
const StockModal = ({ item, onClose, onSave, userProfile }) => {
  const [formData, setFormData] = useState({
    nom: item.nom || '',
    reference: item.reference || '',
    description: item.description || '',
    categorie: item.categorie || '',
    quantite: item.quantite || 0,
    seuilMinimum: item.seuilMinimum || 0,
    prixUnitaire: item.prixUnitaire || '',
    fournisseur: item.fournisseur || '',
    emplacement: item.emplacement || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateDoc(doc(db, 'stock', item.id), {
        ...formData,
        prixUnitaire: formData.prixUnitaire ? parseFloat(formData.prixUnitaire) : null,
        quantite: parseInt(formData.quantite),
        seuilMinimum: parseInt(formData.seuilMinimum),
        updatedAt: new Date(),
        updatedBy: userProfile.id
      });
      toast.success('Article mis à jour avec succès');
      onSave();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Modifier l'article
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Nom de l'article</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.nom}
                  onChange={(e) => setFormData({...formData, nom: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="form-label">Référence</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.reference}
                  onChange={(e) => setFormData({...formData, reference: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                rows="2"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Catégorie</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.categorie}
                  onChange={(e) => setFormData({...formData, categorie: e.target.value})}
                />
              </div>
              
              <div>
                <label className="form-label">Fournisseur</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.fournisseur}
                  onChange={(e) => setFormData({...formData, fournisseur: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Quantité actuelle</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.quantite}
                  onChange={(e) => setFormData({...formData, quantite: e.target.value})}
                  min="0"
                  required
                />
              </div>
              
              <div>
                <label className="form-label">Seuil minimum</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.seuilMinimum}
                  onChange={(e) => setFormData({...formData, seuilMinimum: e.target.value})}
                  min="0"
                  required
                />
              </div>
              
              <div>
                <label className="form-label">Prix unitaire (GNF)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={formData.prixUnitaire}
                  onChange={(e) => setFormData({...formData, prixUnitaire: e.target.value})}
                  min="0"
                />
              </div>
            </div>
            
            <div>
              <label className="form-label">Emplacement</label>
              <input
                type="text"
                className="form-input"
                value={formData.emplacement}
                onChange={(e) => setFormData({...formData, emplacement: e.target.value})}
                placeholder="Ex: Entrepôt A, Étagère 3"
              />
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
                {loading ? 'Mise à jour...' : 'Mettre à jour'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Composant Modal pour créer un nouvel article
const CreateStockModal = ({ onClose, onSave, userProfile }) => {
  const [formData, setFormData] = useState({
    nom: '',
    reference: '',
    description: '',
    categorie: '',
    quantite: 0,
    seuilMinimum: 0,
    prixUnitaire: '',
    fournisseur: '',
    emplacement: ''
  });
  const [loading, setLoading] = useState(false);
  const [articlesValides, setArticlesValides] = useState([]);

  useEffect(() => {
    loadArticlesValides();
  }, []);

  const loadArticlesValides = async () => {
    try {
      // Charger directement depuis la collection 'articles'
      const articlesQuery = collection(db, 'articles');
      const snapshot = await getDocs(articlesQuery);
      const articlesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Extraire les noms des articles et trier
      const articlesArray = articlesData.map(article => article.nom).sort();
      setArticlesValides(articlesArray);
    } catch (error) {
      console.error('Erreur lors du chargement des articles:', error);
    }
  };

  const handleArticleChange = async (e) => {
    const selectedArticle = e.target.value;
    setFormData(prev => ({
      ...prev,
      nom: selectedArticle
    }));

    // Si un article est sélectionné, charger ses détails depuis la collection articles et les commandes validées
    if (selectedArticle) {
      try {
        // Charger les articles
        const articlesQuery = collection(db, 'articles');
        const articlesSnapshot = await getDocs(articlesQuery);
        const articlesData = articlesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Trouver l'article correspondant
        const articleTrouve = articlesData.find(article => article.nom === selectedArticle);

        if (articleTrouve) {
          // Charger les commandes pour récupérer le prix et le fournisseur
          const commandesQuery = collection(db, 'commandes');
          const commandesSnapshot = await getDocs(commandesQuery);
          const commandesData = commandesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          // Trouver la dernière commande validée pour cet article
          const derniereCommande = commandesData
            .filter(commande => 
              commande.article === selectedArticle && 
              commande.statut === 'approuve' && 
              commande.signatureDG && 
              commande.validatedBy &&
              commande.prix &&
              commande.fournisseur
            )
            .sort((a, b) => {
              const dateA = a.createdAt?.toDate?.() || new Date(0);
              const dateB = b.createdAt?.toDate?.() || new Date(0);
              return dateB - dateA;
            })[0];

          setFormData(prev => ({
            ...prev,
            nom: selectedArticle,
            description: articleTrouve.description || '',
            reference: articleTrouve.code || '',
            prixUnitaire: derniereCommande ? derniereCommande.prix.toString() : '',
            fournisseur: derniereCommande ? derniereCommande.fournisseur : ''
          }));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des détails de l\'article:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, 'stock'), {
        ...formData,
        prixUnitaire: formData.prixUnitaire ? parseFloat(formData.prixUnitaire) : null,
        quantite: parseInt(formData.quantite),
        seuilMinimum: parseInt(formData.seuilMinimum),
        createdAt: new Date(),
        createdBy: userProfile.id
      });
      toast.success('Article créé avec succès');
      onSave();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast.error('Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Ajouter un nouvel article
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Nom de l'article</label>
                <select
                  className="form-input"
                  value={formData.nom}
                  onChange={handleArticleChange}
                  required
                >
                  <option value="">Sélectionner un article</option>
                  {articlesValides.map(article => (
                    <option key={article} value={article}>
                      {article}
                    </option>
                  ))}
                </select>
                {articlesValides.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Aucun article validé trouvé. Créez d'abord des commandes et validez-les.
                  </p>
                )}
              </div>
              
              <div>
                <label className="form-label">Référence</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.reference}
                  onChange={(e) => setFormData({...formData, reference: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                rows="2"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Catégorie</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.categorie}
                  onChange={(e) => setFormData({...formData, categorie: e.target.value})}
                />
              </div>
              
              <div>
                <label className="form-label">Fournisseur</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.fournisseur}
                  onChange={(e) => setFormData({...formData, fournisseur: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Quantité initiale</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.quantite}
                  onChange={(e) => setFormData({...formData, quantite: e.target.value})}
                  min="0"
                  required
                />
              </div>
              
              <div>
                <label className="form-label">Seuil minimum</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.seuilMinimum}
                  onChange={(e) => setFormData({...formData, seuilMinimum: e.target.value})}
                  min="0"
                  required
                />
              </div>
              
              <div>
                <label className="form-label">Prix unitaire (GNF)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={formData.prixUnitaire}
                  onChange={(e) => setFormData({...formData, prixUnitaire: e.target.value})}
                  min="0"
                />
              </div>
            </div>
            
            <div>
              <label className="form-label">Emplacement</label>
              <input
                type="text"
                className="form-input"
                value={formData.emplacement}
                onChange={(e) => setFormData({...formData, emplacement: e.target.value})}
                placeholder="Ex: Entrepôt A, Étagère 3"
              />
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
                {loading ? 'Création...' : 'Créer l\'article'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Composant Modal pour la sortie de stock
const SortieStockModal = ({ item, employes, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    quantiteSortie: '',
    dateSortie: new Date().toISOString().split('T')[0],
    employeId: '',
    signature: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave(formData);
    } catch (error) {
      console.error('Erreur lors de la sortie:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignatureChange = (signature) => {
    setFormData(prev => ({ ...prev, signature }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 sm:top-20 mx-auto p-4 sm:p-5 border w-full max-w-md sm:w-96 shadow-lg rounded-md bg-white m-4">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Sortie de stock - {item.nom}
          </h3>
          
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">
              <strong>Quantité disponible:</strong> {item.quantite} {item.unite || 'unité(s)'}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Prix unitaire:</strong> {item.prixUnitaire ? `${item.prixUnitaire} GNF` : 'Non défini'}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Quantité à sortir *
                </label>
                <input
                  type="number"
                  min="1"
                  max={item.quantite}
                  value={formData.quantiteSortie}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value > item.quantite) {
                      toast.error(`La quantité ne peut pas dépasser ${item.quantite}`);
                      return;
                    }
                    setFormData(prev => ({ ...prev, quantiteSortie: e.target.value }));
                  }}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
                {formData.quantiteSortie && parseInt(formData.quantiteSortie) > item.quantite && (
                  <p className="text-red-500 text-sm mt-1">
                    ⚠️ Quantité supérieure à la quantité disponible ({item.quantite})
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date de sortie *
                </label>
                <input
                  type="date"
                  value={formData.dateSortie}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateSortie: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Employé responsable *
                </label>
                <select
                  value={formData.employeId}
                  onChange={(e) => setFormData(prev => ({ ...prev, employeId: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Sélectionner un employé</option>
                  {employes.length > 0 ? (
                    employes.map((employe) => (
                      <option key={employe.id} value={employe.id}>
                        {employe.nom} {employe.prenom} - {employe.service || 'Service non défini'}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Aucun employé trouvé</option>
                  )}
                </select>
                {employes.length === 0 && (
                  <p className="text-orange-500 text-sm mt-1">
                    ⚠️ Aucun employé trouvé. Veuillez d'abord créer des employés dans la page "Employés".
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Signature de l'employé *
                </label>
                <div className="border border-gray-300 rounded-md p-2">
                  <SignaturePad
                    onSave={handleSignatureChange}
                    onCancel={() => {}}
                  />
                </div>
                {formData.signature && (
                  <p className="text-xs text-green-600 mt-1">✓ Signature capturée</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || !formData.signature}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {loading ? 'Enregistrement...' : 'Enregistrer la sortie'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Stock;
