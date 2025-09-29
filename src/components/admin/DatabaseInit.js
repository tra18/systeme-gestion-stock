import React, { useState } from 'react';
import { Database, Download, AlertCircle } from 'lucide-react';
import { initializeDatabase, isDatabaseEmpty } from '../../utils/initDatabase';
import toast from 'react-hot-toast';

const DatabaseInit = () => {
  const [loading, setLoading] = useState(false);
  const [isEmpty, setIsEmpty] = useState(null);

  const checkDatabase = async () => {
    setLoading(true);
    try {
      const empty = await isDatabaseEmpty();
      setIsEmpty(empty);
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      toast.error('Erreur lors de la vérification de la base de données');
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir initialiser la base de données avec des données d\'exemple ? Cette action ne peut pas être annulée.')) {
      return;
    }

    setLoading(true);
    try {
      const success = await initializeDatabase();
      if (success) {
        toast.success('Base de données initialisée avec succès !');
        setIsEmpty(false);
      } else {
        toast.error('Erreur lors de l\'initialisation');
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      toast.error('Erreur lors de l\'initialisation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center mb-4">
        <Database className="h-6 w-6 text-primary-600 mr-3" />
        <h3 className="text-lg font-medium text-gray-900">
          Initialisation de la Base de Données
        </h3>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Cette fonction permet d'initialiser la base de données avec des données d'exemple pour tester l'application.
        </p>

        <div className="flex items-center space-x-4">
          <button
            onClick={checkDatabase}
            disabled={loading}
            className="btn btn-secondary flex items-center"
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            {loading ? 'Vérification...' : 'Vérifier la base'}
          </button>

          {isEmpty !== null && (
            <div className="flex items-center">
              {isEmpty ? (
                <span className="text-sm text-warning-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Base de données vide
                </span>
              ) : (
                <span className="text-sm text-success-600 flex items-center">
                  <Database className="h-4 w-4 mr-1" />
                  Données présentes
                </span>
              )}
            </div>
          )}
        </div>

        {isEmpty === true && (
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-warning-400" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-warning-800">
                  Base de données vide
                </h4>
                <p className="mt-1 text-sm text-warning-700">
                  La base de données ne contient aucune donnée. Vous pouvez l'initialiser avec des données d'exemple.
                </p>
                <div className="mt-3">
                  <button
                    onClick={handleInitialize}
                    disabled={loading}
                    className="btn btn-warning flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {loading ? 'Initialisation...' : 'Initialiser avec des données d\'exemple'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isEmpty === false && (
          <div className="bg-success-50 border border-success-200 rounded-lg p-4">
            <div className="flex">
              <Database className="h-5 w-5 text-success-400" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-success-800">
                  Base de données initialisée
                </h4>
                <p className="mt-1 text-sm text-success-700">
                  La base de données contient déjà des données. L'initialisation n'est pas nécessaire.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            Données d'exemple incluses :
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 3 véhicules (Renault Clio, Peugeot Partner, Citroën C3)</li>
            <li>• 3 fournisseurs (Office Depot, LDLC, Manutan)</li>
            <li>• 3 prestataires de maintenance</li>
            <li>• 3 commandes avec différents statuts</li>
            <li>• 3 entretiens de maintenance</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DatabaseInit;
