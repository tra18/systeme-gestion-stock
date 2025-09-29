import React, { useState } from 'react';
import { Users, Shield, Info, Edit3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { updateUserRole, AVAILABLE_ROLES } from '../utils/updateUserRole';
import { createAdminUser } from '../utils/createAdminUser';
import toast from 'react-hot-toast';

const Parametres = () => {
  const { userProfile, currentUser } = useAuth();
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [newRole, setNewRole] = useState(userProfile?.role || 'service');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  const handleRoleUpdate = async () => {
    if (!currentUser || newRole === userProfile?.role) return;
    
    setIsUpdating(true);
    try {
      const success = await updateUserRole(currentUser.uid, newRole);
      if (success) {
        toast.success('Rôle mis à jour avec succès ! Rechargez la page pour voir les changements.');
        setIsEditingRole(false);
        // Recharger la page après 2 secondes
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.error('Erreur lors de la mise à jour du rôle');
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du rôle');
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateAdmin = async () => {
    if (!adminEmail || !adminPassword) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsCreatingAdmin(true);
    try {
      await createAdminUser(adminEmail, adminPassword, {
        nom: 'Administrateur',
        prenom: 'Admin',
        service: 'Direction'
      });
      toast.success('Utilisateur administrateur créé avec succès !');
      setShowCreateAdmin(false);
      setAdminEmail('');
      setAdminPassword('');
    } catch (error) {
      toast.error('Erreur lors de la création de l\'utilisateur administrateur');
      console.error(error);
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configuration et administration de l'application
        </p>
      </div>

      {/* Informations utilisateur */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Users className="h-6 w-6 text-primary-600 mr-3" />
          <h3 className="text-lg font-medium text-gray-900">
            Informations Utilisateur
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="form-label">Nom complet</label>
            <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
              {userProfile?.prenom} {userProfile?.nom}
            </div>
          </div>
          
          <div>
            <label className="form-label">Email</label>
            <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
              {userProfile?.email}
            </div>
          </div>
          
          <div>
            <label className="form-label">Service</label>
            <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
              {userProfile?.service || 'Non défini'}
            </div>
          </div>
          
          <div>
            <label className="form-label">Rôle</label>
            {!isEditingRole ? (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg flex-1">
                  {userProfile?.role === 'dg' ? 'Directeur Général' :
                   userProfile?.role === 'achat' ? 'Service Achat' :
                   userProfile?.role === 'service' ? 'Service' : userProfile?.role}
                </div>
                <button
                  onClick={() => setIsEditingRole(true)}
                  className="ml-2 p-2 text-primary-600 hover:text-primary-700 transition-colors"
                  title="Modifier le rôle"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="form-input"
                >
                  {Object.entries(AVAILABLE_ROLES).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
                <div className="flex space-x-2">
                  <button
                    onClick={handleRoleUpdate}
                    disabled={isUpdating}
                    className="btn-primary text-sm"
                  >
                    {isUpdating ? 'Mise à jour...' : 'Sauvegarder'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingRole(false);
                      setNewRole(userProfile?.role || 'service');
                    }}
                    className="btn-secondary text-sm"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Permissions */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Shield className="h-6 w-6 text-primary-600 mr-3" />
          <h3 className="text-lg font-medium text-gray-900">
            Permissions
          </h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-900">Gestion des commandes</span>
            <span className="text-sm text-success-600">✓ Autorisé</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-900">Gestion de la maintenance</span>
            <span className="text-sm text-success-600">✓ Autorisé</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-900">Gestion des fournisseurs</span>
            <span className={`text-sm ${['achat', 'dg'].includes(userProfile?.role) ? 'text-success-600' : 'text-gray-400'}`}>
              {['achat', 'dg'].includes(userProfile?.role) ? '✓ Autorisé' : '✗ Non autorisé'}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-900">Gestion des prestataires</span>
            <span className={`text-sm ${['achat', 'dg'].includes(userProfile?.role) ? 'text-success-600' : 'text-gray-400'}`}>
              {['achat', 'dg'].includes(userProfile?.role) ? '✓ Autorisé' : '✗ Non autorisé'}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-900">Gestion des employés</span>
            <span className={`text-sm ${userProfile?.role === 'dg' ? 'text-success-600' : 'text-gray-400'}`}>
              {userProfile?.role === 'dg' ? '✓ Autorisé' : '✗ Non autorisé'}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-900">Administration</span>
            <span className={`text-sm ${userProfile?.role === 'dg' ? 'text-success-600' : 'text-gray-400'}`}>
              {userProfile?.role === 'dg' ? '✓ Autorisé' : '✗ Non autorisé'}
            </span>
          </div>
        </div>
      </div>

      {/* Administration (seulement pour DG) */}
      {userProfile?.role === 'dg' && (
        <>
          {/* Créer un utilisateur administrateur */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Users className="h-6 w-6 text-primary-600 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">
                  Créer un Utilisateur Administrateur
                </h3>
              </div>
              <button
                onClick={() => setShowCreateAdmin(!showCreateAdmin)}
                className="btn-secondary text-sm"
              >
                {showCreateAdmin ? 'Masquer' : 'Afficher'}
              </button>
            </div>
            
            {showCreateAdmin && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="form-input"
                      placeholder="admin@example.com"
                    />
                  </div>
                  <div>
                    <label className="form-label">Mot de passe</label>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="form-input"
                      placeholder="Mot de passe sécurisé"
                    />
                  </div>
                </div>
                <button
                  onClick={handleCreateAdmin}
                  disabled={isCreatingAdmin}
                  className="btn-primary"
                >
                  {isCreatingAdmin ? 'Création...' : 'Créer l\'Administrateur'}
                </button>
                <p className="text-sm text-gray-500">
                  Cet utilisateur aura le rôle "Directeur Général" avec accès complet à toutes les fonctionnalités.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Informations sur l'application */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Info className="h-6 w-6 text-primary-600 mr-3" />
          <h3 className="text-lg font-medium text-gray-900">
            Informations sur l'Application
          </h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-900">Version</span>
            <span className="text-sm text-gray-600">1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Parametres;
