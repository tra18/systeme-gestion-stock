import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Download, 
  Upload, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Database
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const OfflineManager = () => {
  const { userProfile } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [pendingChanges, setPendingChanges] = useState([]);
  const [lastSync, setLastSync] = useState(null);
  const [offlineData, setOfflineData] = useState({
    stock: [],
    commandes: [],
    employes: [],
    articles: []
  });

  useEffect(() => {
    // Écouter les changements de statut de connexion
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connexion rétablie');
      // Démarrer la synchronisation automatique
      syncData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Mode hors ligne activé');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Charger les données hors ligne au démarrage
    loadOfflineData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadOfflineData = () => {
    try {
      const offlineStock = localStorage.getItem('offline_stock');
      const offlineCommandes = localStorage.getItem('offline_commandes');
      const offlineEmployes = localStorage.getItem('offline_employes');
      const offlineArticles = localStorage.getItem('offline_articles');

      setOfflineData({
        stock: offlineStock ? JSON.parse(offlineStock) : [],
        commandes: offlineCommandes ? JSON.parse(offlineCommandes) : [],
        employes: offlineEmployes ? JSON.parse(offlineEmployes) : [],
        articles: offlineArticles ? JSON.parse(offlineArticles) : []
      });

      // Charger les changements en attente
      const pending = localStorage.getItem('pending_changes');
      setPendingChanges(pending ? JSON.parse(pending) : []);

      // Charger la dernière synchronisation
      const lastSyncTime = localStorage.getItem('last_sync');
      setLastSync(lastSyncTime ? new Date(lastSyncTime) : null);

    } catch (error) {
      console.error('Erreur lors du chargement des données hors ligne:', error);
    }
  };

  const saveOfflineData = (collection, data) => {
    try {
      localStorage.setItem(`offline_${collection}`, JSON.stringify(data));
      setOfflineData(prev => ({
        ...prev,
        [collection]: data
      }));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde hors ligne:', error);
      toast.error('Erreur lors de la sauvegarde hors ligne');
    }
  };

  const addPendingChange = (change) => {
    try {
      const newChange = {
        id: Date.now().toString(),
        type: change.type, // 'create', 'update', 'delete'
        collection: change.collection,
        data: change.data,
        timestamp: new Date(),
        userId: userProfile?.uid
      };

      const updatedPending = [...pendingChanges, newChange];
      setPendingChanges(updatedPending);
      localStorage.setItem('pending_changes', JSON.stringify(updatedPending));

      toast.success('Changement enregistré pour synchronisation');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du changement en attente:', error);
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const syncData = async () => {
    if (!isOnline) {
      toast.error('Pas de connexion internet');
      return;
    }

    try {
      setSyncStatus('syncing');
      toast.info('Synchronisation en cours...');

      // Simuler la synchronisation des données
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Traiter les changements en attente
      for (const change of pendingChanges) {
        await processPendingChange(change);
      }

      // Marquer la synchronisation comme terminée
      setLastSync(new Date());
      localStorage.setItem('last_sync', new Date().toISOString());
      
      // Vider les changements en attente
      setPendingChanges([]);
      localStorage.removeItem('pending_changes');

      setSyncStatus('completed');
      toast.success('Synchronisation terminée');

    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      setSyncStatus('error');
      toast.error('Erreur lors de la synchronisation');
    }
  };

  const processPendingChange = async (change) => {
    // Simuler le traitement d'un changement
    console.log('Traitement du changement:', change);
    
    // Ici, vous feriez les appels API réels pour synchroniser avec Firebase
    // await updateFirebaseData(change);
    
    return new Promise(resolve => setTimeout(resolve, 500));
  };

  const downloadOfflineData = () => {
    try {
      const dataToDownload = {
        stock: offlineData.stock,
        commandes: offlineData.commandes,
        employes: offlineData.employes,
        articles: offlineData.articles,
        lastSync: lastSync,
        pendingChanges: pendingChanges
      };

      const blob = new Blob([JSON.stringify(dataToDownload, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `donnees_hors_ligne_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Données hors ligne téléchargées');
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast.error('Erreur lors du téléchargement');
    }
  };

  const uploadOfflineData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Restaurer les données
        if (data.stock) saveOfflineData('stock', data.stock);
        if (data.commandes) saveOfflineData('commandes', data.commandes);
        if (data.employes) saveOfflineData('employes', data.employes);
        if (data.articles) saveOfflineData('articles', data.articles);
        
        if (data.pendingChanges) {
          setPendingChanges(data.pendingChanges);
          localStorage.setItem('pending_changes', JSON.stringify(data.pendingChanges));
        }
        
        if (data.lastSync) {
          setLastSync(new Date(data.lastSync));
          localStorage.setItem('last_sync', data.lastSync);
        }

        toast.success('Données hors ligne restaurées');
      } catch (error) {
        console.error('Erreur lors de la restauration:', error);
        toast.error('Erreur lors de la restauration des données');
      }
    };
    reader.readAsText(file);
  };

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing': return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSyncStatusText = () => {
    switch (syncStatus) {
      case 'syncing': return 'Synchronisation en cours...';
      case 'completed': return 'Synchronisé';
      case 'error': return 'Erreur de synchronisation';
      default: return 'En attente';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion Hors Ligne</h2>
          <p className="text-gray-600">Synchronisation et données hors ligne</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
            isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            <span className="text-sm font-medium">
              {isOnline ? 'En ligne' : 'Hors ligne'}
            </span>
          </div>
        </div>
      </div>

      {/* Statut de synchronisation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {getSyncStatusIcon()}
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Statut de Sync</p>
              <p className="text-lg font-semibold text-gray-900">
                {getSyncStatusText()}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Database className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Dernière Sync</p>
              <p className="text-lg font-semibold text-gray-900">
                {lastSync ? lastSync.toLocaleString() : 'Jamais'}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Changements en Attente</p>
              <p className="text-lg font-semibold text-gray-900">
                {pendingChanges.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Données hors ligne */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Données Hors Ligne</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Database className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <p className="text-sm font-medium text-gray-500">Stock</p>
            <p className="text-2xl font-semibold text-gray-900">{offlineData.stock.length}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Database className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <p className="text-sm font-medium text-gray-500">Commandes</p>
            <p className="text-2xl font-semibold text-gray-900">{offlineData.commandes.length}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Database className="h-8 w-8 mx-auto text-purple-600 mb-2" />
            <p className="text-sm font-medium text-gray-500">Employés</p>
            <p className="text-2xl font-semibold text-gray-900">{offlineData.employes.length}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Database className="h-8 w-8 mx-auto text-orange-600 mb-2" />
            <p className="text-sm font-medium text-gray-500">Articles</p>
            <p className="text-2xl font-semibold text-gray-900">{offlineData.articles.length}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={syncData}
            disabled={!isOnline || syncStatus === 'syncing'}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Upload className="h-4 w-4" />
            Synchroniser
          </button>

          <button
            onClick={downloadOfflineData}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Télécharger les Données
          </button>

          <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
            <Upload className="h-4 w-4" />
            Restaurer les Données
            <input
              type="file"
              accept=".json"
              onChange={uploadOfflineData}
              className="hidden"
            />
          </label>

          <button
            onClick={loadOfflineData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Changements en attente */}
      {pendingChanges.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Changements en Attente ({pendingChanges.length})
          </h3>
          <div className="space-y-2">
            {pendingChanges.map((change) => (
              <div key={change.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {change.type.toUpperCase()} - {change.collection}
                  </p>
                  <p className="text-xs text-gray-600">
                    {change.timestamp.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-yellow-600 font-medium">
                    En attente
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineManager;

