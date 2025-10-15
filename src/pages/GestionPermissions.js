import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Lock, 
  Unlock,
  Search,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { db } from '../firebase/config';
import { 
  collection, 
  getDocs,
  doc,
  updateDoc
} from 'firebase/firestore';
import toast from 'react-hot-toast';

const GestionPermissions = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [permissions, setPermissions] = useState({});

  // Liste de toutes les pages disponibles
  const availablePages = [
    { id: 'dashboard', name: 'Tableau de bord', category: 'Principal' },
    { id: 'nouvelle-commande', name: 'Nouvelle Commande', category: 'Commandes' },
    { id: 'service-achat', name: 'Service Achat', category: 'Commandes' },
    { id: 'validation-dg', name: 'Validation DG', category: 'Commandes' },
    { id: 'commandes', name: 'Liste Commandes', category: 'Commandes' },
    { id: 'maintenance', name: 'Maintenance', category: 'Véhicules' },
    { id: 'stock', name: 'Gestion Stock', category: 'Inventaire' },
    { id: 'articles', name: 'Articles', category: 'Inventaire' },
    { id: 'services', name: 'Services', category: 'Organisation' },
    { id: 'employes', name: 'Employés', category: 'Organisation' },
    { id: 'ressources-humaines', name: 'Ressources Humaines', category: 'RH' },
    { id: 'gestion-it', name: 'Gestion IT', category: 'IT' },
    { id: 'budgets', name: 'Budgets', category: 'Finance' },
    { id: 'rapports', name: 'Rapports', category: 'Analyse' },
    { id: 'fournisseurs', name: 'Fournisseurs', category: 'Partenaires' },
    { id: 'prestataires', name: 'Prestataires', category: 'Partenaires' },
    { id: 'alertes', name: 'Alertes', category: 'Notifications' },
    { id: 'parametres', name: 'Paramètres', category: 'Système' },
    { id: 'dashboard-avance', name: 'Dashboard Avancé', category: 'Avancé' },
    { id: 'hors-ligne', name: 'Mode Hors Ligne', category: 'Avancé' },
    { id: 'gestion-permissions', name: 'Gestion Permissions', category: 'Administration' },
  ];

  // Grouper les pages par catégorie
  const pagesByCategory = availablePages.reduce((acc, page) => {
    if (!acc[page.category]) {
      acc[page.category] = [];
    }
    acc[page.category].push(page);
    return acc;
  }, {});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const usersData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setUsers(usersData);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setPermissions(user.permissions || {});
  };

  const togglePermission = (pageId) => {
    setPermissions(prev => ({
      ...prev,
      [pageId]: !prev[pageId]
    }));
  };

  const selectAllInCategory = (category) => {
    const categoryPages = pagesByCategory[category];
    const newPermissions = { ...permissions };
    categoryPages.forEach(page => {
      newPermissions[page.id] = true;
    });
    setPermissions(newPermissions);
  };

  const deselectAllInCategory = (category) => {
    const categoryPages = pagesByCategory[category];
    const newPermissions = { ...permissions };
    categoryPages.forEach(page => {
      newPermissions[page.id] = false;
    });
    setPermissions(newPermissions);
  };

  const savePermissions = async () => {
    if (!selectedUser) {
      toast.error('Veuillez sélectionner un utilisateur');
      return;
    }

    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', selectedUser.id), {
        permissions: permissions,
        updatedAt: new Date()
      });
      
      // Mettre à jour l'utilisateur dans la liste
      setUsers(users.map(u => 
        u.id === selectedUser.id 
          ? { ...u, permissions } 
          : u
      ));
      
      toast.success(`✅ Permissions mises à jour pour ${selectedUser.name}`);
    } catch (error) {
      console.error('Erreur sauvegarde permissions:', error);
      toast.error('❌ Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      'dg': 'bg-purple-100 text-purple-800',
      'achat': 'bg-blue-100 text-blue-800',
      'service': 'bg-green-100 text-green-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getPermissionCount = (user) => {
    if (!user.permissions) return 0;
    return Object.values(user.permissions).filter(Boolean).length;
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Shield className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-800">
            Gestion des Permissions
          </h1>
        </div>
        <p className="text-gray-600">
          Contrôlez l'accès de chaque utilisateur aux différentes pages de l'application
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des utilisateurs */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Utilisateurs ({users.length})
            </h2>
            
            {/* Barre de recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Liste des utilisateurs */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredUsers.map(user => (
              <div
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedUser?.id === user.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(user.role)}`}>
                        {user.role === 'dg' ? 'Directeur Général' : user.role === 'achat' ? 'Service Achat' : 'Service'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {getPermissionCount(user)} pages
                      </span>
                    </div>
                  </div>
                  {selectedUser?.id === user.id && (
                    <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={loadUsers}
            className="w-full mt-4 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualiser</span>
          </button>
        </div>

        {/* Panneau de permissions */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          {selectedUser ? (
            <>
              {/* En-tête utilisateur sélectionné */}
              <div className="mb-6 pb-6 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      Permissions de {selectedUser.name}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">{selectedUser.email}</p>
                    <span className={`inline-block mt-2 px-3 py-1 text-sm rounded-full ${getRoleColor(selectedUser.role)}`}>
                      {selectedUser.role === 'dg' ? 'Directeur Général' : selectedUser.role === 'achat' ? 'Service Achat' : 'Service'}
                    </span>
                  </div>
                  <button
                    onClick={savePermissions}
                    disabled={saving}
                    className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                  >
                    <Save className="h-5 w-5" />
                    <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
                  </button>
                </div>

                {/* Statistiques */}
                <div className="mt-4 flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Unlock className="h-4 w-4 text-green-600" />
                    <span className="text-gray-600">
                      Accès autorisé : <strong>{Object.values(permissions).filter(Boolean).length}</strong>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-red-600" />
                    <span className="text-gray-600">
                      Accès refusé : <strong>{availablePages.length - Object.values(permissions).filter(Boolean).length}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Liste des permissions par catégorie */}
              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                {Object.entries(pagesByCategory).map(([category, pages]) => {
                  const allSelected = pages.every(page => permissions[page.id]);
                  const someSelected = pages.some(page => permissions[page.id]);
                  
                  return (
                    <div key={category} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-800">{category}</h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => selectAllInCategory(category)}
                            className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                          >
                            Tout sélectionner
                          </button>
                          <button
                            onClick={() => deselectAllInCategory(category)}
                            className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            Tout désélectionner
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {pages.map(page => (
                          <button
                            key={page.id}
                            onClick={() => togglePermission(page.id)}
                            className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                              permissions[page.id]
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                            }`}
                          >
                            <span className={`text-sm font-medium ${
                              permissions[page.id] ? 'text-green-800' : 'text-gray-600'
                            }`}>
                              {page.name}
                            </span>
                            {permissions[page.id] ? (
                              <Unlock className="h-5 w-5 text-green-600" />
                            ) : (
                              <Lock className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bouton enregistrer en bas */}
              <div className="mt-6 pt-6 border-t flex justify-end">
                <button
                  onClick={savePermissions}
                  disabled={saving}
                  className="flex items-center space-x-2 px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors text-lg font-medium"
                >
                  <Save className="h-5 w-5" />
                  <span>{saving ? 'Enregistrement...' : 'Enregistrer les permissions'}</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <Users className="h-20 w-20 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Aucun utilisateur sélectionné
              </h3>
              <p className="text-gray-500">
                Sélectionnez un utilisateur dans la liste de gauche pour gérer ses permissions
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GestionPermissions;

