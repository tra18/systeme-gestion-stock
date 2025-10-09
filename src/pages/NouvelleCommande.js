import React, { useState, useEffect } from 'react';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import BudgetChecker from '../components/budgets/BudgetChecker';

const NouvelleCommande = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [articlesValides, setArticlesValides] = useState([]);
  
  // Données de base de la commande
  const [commandeData, setCommandeData] = useState({
    service: '',
    urgence: 'normale',
    commentaire: '',
    prixEstime: '' // Pour la vérification budgétaire
  });
  
  // Liste des articles dans la commande
  const [articles, setArticles] = useState([
    {
      id: 1,
      article: '',
      description: '',
      quantite: '',
      unite: 'unité'
    }
  ]);

  // Charger les services et articles validés
  useEffect(() => {
    loadServices();
    loadArticlesValides();
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

  const loadArticlesValides = async () => {
    try {
      // Charger directement depuis la collection 'articles'
      const articlesQuery = query(collection(db, 'articles'), orderBy('nom'));
      const snapshot = await getDocs(articlesQuery);
      const articlesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Extraire les noms des articles et trier
      const articlesArray = articlesData.map(article => article.nom).sort();
      setArticlesValides(articlesArray);
    } catch (error) {
      console.error('Erreur lors du chargement des articles:', error);
    }
  };

  const handleCommandeChange = (e) => {
    const { name, value } = e.target;
    setCommandeData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArticleChange = async (index, e) => {
    const selectedArticle = e.target.value;
    const newArticles = [...articles];
    newArticles[index] = {
      ...newArticles[index],
      article: selectedArticle
    };

    // Si un article est sélectionné, charger ses détails depuis la collection articles
    if (selectedArticle) {
      try {
        const articlesQuery = query(collection(db, 'articles'), orderBy('nom'));
        const snapshot = await getDocs(articlesQuery);
        const articlesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Trouver l'article correspondant
        const articleTrouve = articlesData.find(article => article.nom === selectedArticle);

        if (articleTrouve) {
          newArticles[index] = {
            ...newArticles[index],
            article: selectedArticle,
            description: articleTrouve.description || '',
            unite: 'unité' // Unité par défaut
          };
        }
      } catch (error) {
        console.error('Erreur lors du chargement des détails de l\'article:', error);
      }
    }

    setArticles(newArticles);
  };

  const handleArticleFieldChange = (index, field, value) => {
    const newArticles = [...articles];
    newArticles[index] = {
      ...newArticles[index],
      [field]: value
    };
    setArticles(newArticles);
  };

  const addArticle = () => {
    const newId = Math.max(...articles.map(a => a.id), 0) + 1;
    setArticles([...articles, {
      id: newId,
      article: '',
      description: '',
      quantite: '',
      unite: 'unité'
    }]);
  };

  const removeArticle = (index) => {
    if (articles.length > 1) {
      const newArticles = articles.filter((_, i) => i !== index);
      setArticles(newArticles);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!commandeData.service) {
        toast.error('Veuillez sélectionner un service');
        setLoading(false);
        return;
      }

      const validArticles = articles.filter(article => 
        article.article && article.quantite && article.quantite > 0
      );

      if (validArticles.length === 0) {
        toast.error('Veuillez ajouter au moins un article valide');
        setLoading(false);
        return;
      }

      // Créer une commande pour chaque article
      for (const article of validArticles) {
        const commandeDataToSave = {
          service: commandeData.service,
          article: article.article,
          description: article.description,
          quantite: parseInt(article.quantite),
          unite: article.unite,
          urgence: commandeData.urgence,
          commentaire: commandeData.commentaire,
          statut: 'en_attente_prix',
          createdBy: userProfile?.uid || 'system',
          createdByName: userProfile?.nom || 'Système',
          createdAt: new Date(),
          prix: null,
          fournisseur: null,
          signatureDG: null,
          commentaireDG: null,
          validatedAt: null,
          // Ajouter un identifiant de groupe pour lier les commandes
          groupeCommande: `groupe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };

        await addDoc(collection(db, 'commandes'), commandeDataToSave);
      }

      toast.success(`${validArticles.length} commande(s) créée(s) avec succès !`);
      
      // Réinitialiser le formulaire
      setCommandeData({
        service: '',
        urgence: 'normale',
        commentaire: '',
        prixEstime: ''
      });
      setArticles([{
        id: 1,
        article: '',
        description: '',
        quantite: '',
        unite: 'unité'
      }]);
    } catch (error) {
      console.error('Erreur lors de la création des commandes:', error);
      toast.error('Erreur lors de la création des commandes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Nouvelle Commande Groupée</h1>
        <p className="text-gray-600 text-sm sm:text-base">Créez une commande avec plusieurs articles pour votre service</p>
      </div>

      {/* Workflow Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-medium text-blue-900 mb-2">📋 Workflow des Commandes</h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
            <span className="text-blue-700 font-medium">Service (Vous)</span>
          </div>
          <div className="text-blue-400 hidden sm:block">→</div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
            <span className="text-gray-600">Service Achat</span>
          </div>
          <div className="text-gray-400 hidden sm:block">→</div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
            <span className="text-gray-600">Directeur Général</span>
          </div>
        </div>
      </div>

      {/* Formulaire de Commande */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">📝 Informations de la Commande</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service *
              </label>
              <select
                name="service"
                value={commandeData.service}
                onChange={handleCommandeChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Niveau d'urgence
              </label>
              <select
                name="urgence"
                value={commandeData.urgence}
                onChange={handleCommandeChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="normale">🟢 Normale</option>
                <option value="urgente">🟡 Urgente</option>
                <option value="critique">🔴 Critique</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commentaire général
            </label>
            <textarea
              name="commentaire"
              value={commandeData.commentaire}
              onChange={handleCommandeChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ajoutez des informations complémentaires pour cette commande groupée..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prix estimé total (GNF) <span className="text-gray-500 text-xs">(optionnel - pour vérification budgétaire)</span>
            </label>
            <input
              type="number"
              name="prixEstime"
              value={commandeData.prixEstime}
              onChange={handleCommandeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>

          {/* Vérification budgétaire */}
          {commandeData.service && commandeData.prixEstime && parseFloat(commandeData.prixEstime) > 0 && (
            <BudgetChecker 
              service={commandeData.service}
              montantCommande={commandeData.prixEstime}
            />
          )}

          {/* Liste des articles */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">📦 Articles de la Commande</h3>
              <button
                type="button"
                onClick={addArticle}
                className="btn btn-primary flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un article
              </button>
            </div>

            <div className="space-y-4">
              {articles.map((article, index) => (
                <div key={article.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-medium text-gray-700">Article {index + 1}</h4>
                    {articles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArticle(index)}
                        className="text-red-600 hover:text-red-800"
                        title="Supprimer cet article"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Article *
                      </label>
                      <select
                        value={article.article}
                        onChange={(e) => handleArticleChange(index, e)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Sélectionner un article</option>
                        {articlesValides.map(articleOption => (
                          <option key={articleOption} value={articleOption}>
                            {articleOption}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantité *
                      </label>
                      <input
                        type="number"
                        value={article.quantite}
                        onChange={(e) => handleArticleFieldChange(index, 'quantite', e.target.value)}
                        required
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: 10"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={article.description}
                      onChange={(e) => handleArticleFieldChange(index, 'description', e.target.value)}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Description de l'article..."
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unité de mesure *
                    </label>
                    <select
                      value={article.unite}
                      onChange={(e) => handleArticleFieldChange(index, 'unite', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                </div>
              ))}
            </div>

            {articlesValides.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-yellow-700">
                  Aucun article validé trouvé. Créez d'abord des commandes et validez-les.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <X className="h-4 w-4 mr-2" />
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Création...' : `Créer ${articles.filter(a => a.article && a.quantite).length} commande(s)`}
            </button>
          </div>
        </form>
      </div>

      {/* Info sur le processus */}
      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-green-900 mb-2">✅ Prochaines étapes</h3>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Chaque article créera une commande séparée</li>
          <li>• Toutes les commandes seront liées par un identifiant de groupe</li>
          <li>• Les commandes seront envoyées au <strong>Service Achat</strong></li>
          <li>• Le Service Achat ajoutera les <strong>prix en GNF</strong></li>
          <li>• Le <strong>Directeur Général</strong> validera avec sa signature</li>
        </ul>
      </div>
    </div>
  );
};

export default NouvelleCommande;