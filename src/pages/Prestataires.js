import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Wrench, 
  Phone, 
  Mail, 
  MapPin, 
  Eye, 
  Edit, 
  Trash2,
  Star,
  Clock
} from 'lucide-react';
import { collection, query, orderBy, getDocs, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Prestataires = () => {
  const { userProfile } = useAuth();
  const [prestataires, setPrestataires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPrestataire, setSelectedPrestataire] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadPrestataires();
  }, []);

  const loadPrestataires = async () => {
    try {
      const prestatairesQuery = query(collection(db, 'prestataires'), orderBy('nom'));
      const snapshot = await getDocs(prestatairesQuery);
      const prestatairesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPrestataires(prestatairesData);
    } catch (error) {
      console.error('Erreur lors du chargement des prestataires:', error);
      toast.error('Erreur lors du chargement des prestataires');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (prestataireId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce prestataire ?')) {
      try {
        await deleteDoc(doc(db, 'prestataires', prestataireId));
        toast.success('Prestataire supprimé avec succès');
        loadPrestataires();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression du prestataire');
      }
    }
  };

  const filteredPrestataires = prestataires.filter(prestataire =>
    prestataire.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prestataire.specialite?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prestataire.ville?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Prestataires</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez vos prestataires de maintenance et leurs services
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouveau prestataire
        </button>
      </div>

      {/* Recherche */}
      <div className="flex-1">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher un prestataire..."
            className="form-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grille des prestataires */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrestataires.map((prestataire) => (
          <div key={prestataire.id} className="card hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-warning-100 rounded-lg flex items-center justify-center">
                    <Wrench className="h-6 w-6 text-warning-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {prestataire.nom}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {prestataire.specialite}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < (prestataire.note || 0) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {prestataire.telephone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {prestataire.telephone}
                </div>
              )}
              
              {prestataire.email && (
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {prestataire.email}
                </div>
              )}
              
              {prestataire.adresse && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {prestataire.adresse}, {prestataire.ville}
                </div>
              )}
              
              {prestataire.delaiMoyen && (
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  Délai moyen: {prestataire.delaiMoyen} jours
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setSelectedPrestataire(prestataire);
                  setShowModal(true);
                }}
                className="text-primary-600 hover:text-primary-900 p-1"
                title="Voir détails"
              >
                <Eye className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => {
                  setSelectedPrestataire(prestataire);
                  setShowModal(true);
                }}
                className="text-warning-600 hover:text-warning-900 p-1"
                title="Modifier"
              >
                <Edit className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => handleDelete(prestataire.id)}
                className="text-danger-600 hover:text-danger-900 p-1"
                title="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredPrestataires.length === 0 && (
        <div className="text-center py-12">
          <Wrench className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun prestataire</h3>
          <p className="mt-1 text-sm text-gray-500">
            Commencez par ajouter un nouveau prestataire.
          </p>
        </div>
      )}

      {/* Modal de détails/modification */}
      {showModal && selectedPrestataire && (
        <PrestataireModal
          prestataire={selectedPrestataire}
          onClose={() => {
            setShowModal(false);
            setSelectedPrestataire(null);
          }}
          onSave={loadPrestataires}
          userProfile={userProfile}
        />
      )}

      {/* Modal de création */}
      {showCreateModal && (
        <CreatePrestataireModal
          onClose={() => setShowCreateModal(false)}
          onSave={loadPrestataires}
          userProfile={userProfile}
        />
      )}
    </div>
  );
};

// Composant Modal pour les détails/modification
const PrestataireModal = ({ prestataire, onClose, onSave, userProfile }) => {
  const [formData, setFormData] = useState({
    nom: prestataire.nom || '',
    specialite: prestataire.specialite || '',
    telephone: prestataire.telephone || '',
    email: prestataire.email || '',
    adresse: prestataire.adresse || '',
    ville: prestataire.ville || '',
    codePostal: prestataire.codePostal || '',
    delaiMoyen: prestataire.delaiMoyen || '',
    note: prestataire.note || 0,
    commentaires: prestataire.commentaires || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'prestataires', prestataire.id), {
        ...formData,
        delaiMoyen: formData.delaiMoyen ? parseInt(formData.delaiMoyen) : null,
        note: parseInt(formData.note),
        updatedAt: new Date(),
        updatedBy: userProfile.id
      });
      toast.success('Prestataire mis à jour');
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
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Détails du prestataire
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="form-label">Nom *</label>
              <input
                type="text"
                className="form-input"
                value={formData.nom}
                onChange={(e) => setFormData({...formData, nom: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className="form-label">Spécialité</label>
              <select
                className="form-input"
                value={formData.specialite}
                onChange={(e) => setFormData({...formData, specialite: e.target.value})}
              >
                <option value="">Sélectionner une spécialité</option>
                <option value="mecanique">Mécanique automobile</option>
                <option value="carrosserie">Carrosserie</option>
                <option value="electricite">Électricité automobile</option>
                <option value="pneumatiques">Pneumatiques</option>
                <option value="vidange">Vidange et entretien</option>
                <option value="controle_technique">Contrôle technique</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Téléphone</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.telephone}
                  onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                />
              </div>
              
              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <label className="form-label">Adresse</label>
              <input
                type="text"
                className="form-input"
                value={formData.adresse}
                onChange={(e) => setFormData({...formData, adresse: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Ville</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.ville}
                  onChange={(e) => setFormData({...formData, ville: e.target.value})}
                />
              </div>
              
              <div>
                <label className="form-label">Code postal</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.codePostal}
                  onChange={(e) => setFormData({...formData, codePostal: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <label className="form-label">Délai moyen (jours)</label>
              <input
                type="number"
                className="form-input"
                value={formData.delaiMoyen}
                onChange={(e) => setFormData({...formData, delaiMoyen: e.target.value})}
                placeholder="Ex: 3"
                min="1"
              />
            </div>
            
            <div>
              <label className="form-label">Note (0-5)</label>
              <select
                className="form-input"
                value={formData.note}
                onChange={(e) => setFormData({...formData, note: e.target.value})}
              >
                <option value="0">0 - Très mauvais</option>
                <option value="1">1 - Mauvais</option>
                <option value="2">2 - Moyen</option>
                <option value="3">3 - Bon</option>
                <option value="4">4 - Très bon</option>
                <option value="5">5 - Excellent</option>
              </select>
            </div>
            
            <div>
              <label className="form-label">Commentaires</label>
              <textarea
                className="form-input"
                rows="3"
                value={formData.commentaires}
                onChange={(e) => setFormData({...formData, commentaires: e.target.value})}
                placeholder="Notes sur ce prestataire..."
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="btn btn-secondary"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant Modal pour la création
const CreatePrestataireModal = ({ onClose, onSave, userProfile }) => {
  const [formData, setFormData] = useState({
    nom: '',
    specialite: '',
    telephone: '',
    email: '',
    adresse: '',
    ville: '',
    codePostal: '',
    delaiMoyen: '',
    note: 0,
    commentaires: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await addDoc(collection(db, 'prestataires'), {
        ...formData,
        delaiMoyen: formData.delaiMoyen ? parseInt(formData.delaiMoyen) : null,
        note: parseInt(formData.note),
        createdBy: userProfile.id,
        createdAt: new Date()
      });
      toast.success('Prestataire créé avec succès');
      onSave();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast.error('Erreur lors de la création du prestataire');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Nouveau prestataire
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Nom *</label>
              <input
                type="text"
                className="form-input"
                value={formData.nom}
                onChange={(e) => setFormData({...formData, nom: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className="form-label">Spécialité</label>
              <select
                className="form-input"
                value={formData.specialite}
                onChange={(e) => setFormData({...formData, specialite: e.target.value})}
              >
                <option value="">Sélectionner une spécialité</option>
                <option value="mecanique">Mécanique automobile</option>
                <option value="carrosserie">Carrosserie</option>
                <option value="electricite">Électricité automobile</option>
                <option value="pneumatiques">Pneumatiques</option>
                <option value="vidange">Vidange et entretien</option>
                <option value="controle_technique">Contrôle technique</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Téléphone</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.telephone}
                  onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                />
              </div>
              
              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <label className="form-label">Adresse</label>
              <input
                type="text"
                className="form-input"
                value={formData.adresse}
                onChange={(e) => setFormData({...formData, adresse: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Ville</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.ville}
                  onChange={(e) => setFormData({...formData, ville: e.target.value})}
                />
              </div>
              
              <div>
                <label className="form-label">Code postal</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.codePostal}
                  onChange={(e) => setFormData({...formData, codePostal: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <label className="form-label">Délai moyen (jours)</label>
              <input
                type="number"
                className="form-input"
                value={formData.delaiMoyen}
                onChange={(e) => setFormData({...formData, delaiMoyen: e.target.value})}
                placeholder="Ex: 3"
                min="1"
              />
            </div>
            
            <div>
              <label className="form-label">Note (0-5)</label>
              <select
                className="form-input"
                value={formData.note}
                onChange={(e) => setFormData({...formData, note: e.target.value})}
              >
                <option value="0">0 - Très mauvais</option>
                <option value="1">1 - Mauvais</option>
                <option value="2">2 - Moyen</option>
                <option value="3">3 - Bon</option>
                <option value="4">4 - Très bon</option>
                <option value="5">5 - Excellent</option>
              </select>
            </div>
            
            <div>
              <label className="form-label">Commentaires</label>
              <textarea
                className="form-input"
                rows="3"
                value={formData.commentaires}
                onChange={(e) => setFormData({...formData, commentaires: e.target.value})}
                placeholder="Notes sur ce prestataire..."
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
                {loading ? 'Création...' : 'Créer le prestataire'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Prestataires;
