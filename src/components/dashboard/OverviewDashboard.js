import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Users, 
  Package, 
  Car, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Activity,
  Calendar
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

const OverviewDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState([]);

  useEffect(() => {
    loadOverviewData();
  }, []);

  const loadOverviewData = async () => {
    setLoading(true);
    try {
      // Charger toutes les données en parallèle
      const [
        commandesSnap,
        employesSnap,
        stockSnap,
        vehiculesSnap,
        presencesSnap,
        congesSnap,
        fournisseursSnap
      ] = await Promise.all([
        getDocs(collection(db, 'commandes')),
        getDocs(collection(db, 'employes')),
        getDocs(collection(db, 'stock')),
        getDocs(collection(db, 'vehicules')),
        getDocs(collection(db, 'presences')),
        getDocs(collection(db, 'conges')),
        getDocs(collection(db, 'fournisseurs'))
      ]);

      const commandes = commandesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const employes = employesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const stock = stockSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const vehicules = vehiculesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const presences = presencesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const conges = congesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const fournisseurs = fournisseursSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculer les statistiques
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const newStats = {
        // Commandes
        totalCommandes: commandes.length,
        commandesAujourdhui: commandes.filter(c => {
          const date = c.createdAt?.toDate?.();
          return date && date >= today;
        }).length,
        commandesEnAttente: commandes.filter(c => c.statut === 'en_attente').length,
        commandesApprouvees: commandes.filter(c => c.statut === 'approuve').length,
        // Employés
        totalEmployes: employes.length,
        employesActifs: employes.filter(e => e.statut === 'actif').length,
        presencesAujourdhui: presences.filter(p => {
          const date = p.date?.toDate?.();
          return date && date >= today;
        }).length,
        // Stock
        totalArticles: stock.length,
        stockFaible: stock.filter(s => s.quantite <= (s.seuilMin || 10)).length,
        // Maintenance
        totalVehicules: vehicules.length,
        vehiculesEnMaintenance: vehicules.filter(v => v.statut === 'en_maintenance').length,
        // RH
        congesEnAttente: conges.filter(c => c.statut === 'en_attente').length,
        // Fournisseurs
        totalFournisseurs: fournisseurs.length
      };

      setStats(newStats);

      // Créer les activités récentes
      const activities = [];
      
      // Commandes récentes
      const recentCommandes = [...commandes]
        .sort((a, b) => (b.createdAt?.toDate?.() || new Date(0)) - (a.createdAt?.toDate?.() || new Date(0)))
        .slice(0, 3);
      
      recentCommandes.forEach(cmd => {
        activities.push({
          type: 'commande',
          icon: ShoppingCart,
          color: 'blue',
          title: 'Nouvelle commande',
          description: `${cmd.description?.substring(0, 40)}...` || 'Sans description',
          time: cmd.createdAt?.toDate?.(),
          author: cmd.createdByName || 'Inconnu'
        });
      });

      // Présences récentes
      const recentPresences = [...presences]
        .sort((a, b) => (b.createdAt?.toDate?.() || new Date(0)) - (a.createdAt?.toDate?.() || new Date(0)))
        .slice(0, 2);
      
      recentPresences.forEach(presence => {
        activities.push({
          type: 'presence',
          icon: CheckCircle,
          color: 'green',
          title: 'Pointage effectué',
          description: `Arrivée à ${presence.heureArrivee}`,
          time: presence.createdAt?.toDate?.(),
          author: 'Employé'
        });
      });

      // Trier par date
      activities.sort((a, b) => (b.time || new Date(0)) - (a.time || new Date(0)));
      setRecentActivities(activities.slice(0, 5));

    } catch (error) {
      console.error('Erreur chargement vue d\'ensemble:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonctions pour gérer les clics sur les cartes
  const handleCardClick = async (type) => {
    setLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch (type) {
        case 'commandes':
          const commandesSnap = await getDocs(collection(db, 'commandes'));
          const commandes = commandesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          const commandesAujourdhui = commandes.filter(c => {
            const date = c.createdAt?.toDate?.();
            return date && date >= today;
          });
          setModalData(commandesAujourdhui);
          setModalType('commandes');
          break;

        case 'employes':
          const [presencesSnap, employesSnap] = await Promise.all([
            getDocs(collection(db, 'presences')),
            getDocs(collection(db, 'employes'))
          ]);
          const presences = presencesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          const employes = employesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          const presencesAujourdhui = presences.filter(p => {
            const date = p.date?.toDate?.();
            return date && date >= today;
          });

          // Enrichir les présences avec les données des employés
          const presencesEnrichies = presencesAujourdhui.map(presence => {
            const employe = employes.find(e => e.id === presence.employeId);
            return {
              ...presence,
              employeData: employe ? {
                nom: employe.nom,
                prenom: employe.prenom,
                poste: employe.poste
              } : null
            };
          });

          setModalData(presencesEnrichies);
          setModalType('presences');
          break;

        case 'stock':
          const stockSnap = await getDocs(collection(db, 'stock'));
          const stock = stockSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          const stockFaible = stock.filter(s => s.quantite <= (s.seuilMin || 10));
          setModalData(stockFaible);
          setModalType('stock');
          break;

        case 'vehicules':
          const vehiculesSnap = await getDocs(collection(db, 'vehicules'));
          const vehicules = vehiculesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          const vehiculesEnMaintenance = vehicules.filter(v => v.statut === 'en_maintenance');
          setModalData(vehiculesEnMaintenance);
          setModalType('vehicules');
          break;

        default:
          break;
      }
      setShowModal(true);
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setModalData([]);
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Commandes */}
        <div 
          onClick={() => handleCardClick('commandes')}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Commandes</p>
              <p className="text-4xl font-bold mt-2">{stats.totalCommandes}</p>
              <p className="text-blue-100 text-xs mt-2">
                {stats.commandesAujourdhui} aujourd'hui
              </p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <ShoppingCart size={32} />
            </div>
          </div>
        </div>

        {/* Employés */}
        <div 
          onClick={() => handleCardClick('employes')}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Employés</p>
              <p className="text-4xl font-bold mt-2">{stats.totalEmployes}</p>
              <p className="text-green-100 text-xs mt-2">
                {stats.presencesAujourdhui} présents
              </p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <Users size={32} />
            </div>
          </div>
        </div>

        {/* Stock */}
        <div 
          onClick={() => handleCardClick('stock')}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Articles</p>
              <p className="text-4xl font-bold mt-2">{stats.totalArticles}</p>
              <p className="text-purple-100 text-xs mt-2 flex items-center space-x-1">
                <AlertTriangle size={12} />
                <span>{stats.stockFaible} stock faible</span>
              </p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <Package size={32} />
            </div>
          </div>
        </div>

        {/* Véhicules */}
        <div 
          onClick={() => handleCardClick('vehicules')}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Véhicules</p>
              <p className="text-4xl font-bold mt-2">{stats.totalVehicules}</p>
              <p className="text-orange-100 text-xs mt-2">
                {stats.vehiculesEnMaintenance} en maintenance
              </p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <Car size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Section du milieu */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activités récentes */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Activity className="mr-2 text-blue-600" size={20} />
              Activités récentes
            </h3>
            <button
              onClick={loadOverviewData}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Actualiser
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                      activity.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                      activity.color === 'green' ? 'bg-green-100 text-green-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-600 truncate">{activity.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-400">
                          {activity.time?.toLocaleString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            day: '2-digit',
                            month: '2-digit'
                          }) || 'N/A'}
                        </span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">{activity.author}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Activity className="mx-auto text-gray-400 mb-2" size={48} />
                <p className="text-sm text-gray-500">Aucune activité récente</p>
              </div>
            )}
          </div>
        </div>

        {/* Statut des modules */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <CheckCircle className="mr-2 text-green-600" size={20} />
            Statut des modules
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <ShoppingCart className="text-blue-600" size={20} />
                <span className="text-sm font-medium text-gray-900">Commandes</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{stats.commandesApprouvees}</p>
                <p className="text-xs text-gray-500">approuvées</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="text-green-600" size={20} />
                <span className="text-sm font-medium text-gray-900">RH</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{stats.employesActifs}</p>
                <p className="text-xs text-gray-500">employés actifs</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Package className="text-purple-600" size={20} />
                <span className="text-sm font-medium text-gray-900">Stock</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{stats.totalArticles}</p>
                <p className="text-xs text-gray-500">articles</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Car className="text-orange-600" size={20} />
                <span className="text-sm font-medium text-gray-900">Maintenance</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{stats.totalVehicules}</p>
                <p className="text-xs text-gray-500">véhicules</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alertes importantes */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <AlertTriangle className="mr-2 text-orange-600" size={20} />
          Alertes importantes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.stockFaible > 0 && (
            <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
              <AlertTriangle className="text-red-600 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-semibold text-red-900">Stock faible</p>
                <p className="text-xs text-red-700">{stats.stockFaible} article(s)</p>
              </div>
            </div>
          )}

          {stats.congesEnAttente > 0 && (
            <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
              <Calendar className="text-yellow-600 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-semibold text-yellow-900">Congés en attente</p>
                <p className="text-xs text-yellow-700">{stats.congesEnAttente} demande(s)</p>
              </div>
            </div>
          )}

          {stats.commandesEnAttente > 0 && (
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <Clock className="text-blue-600 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-semibold text-blue-900">Commandes en attente</p>
                <p className="text-xs text-blue-700">{stats.commandesEnAttente} commande(s)</p>
              </div>
            </div>
          )}

          {stats.vehiculesEnMaintenance > 0 && (
            <div className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
              <Car className="text-orange-600 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-semibold text-orange-900">Maintenance en cours</p>
                <p className="text-xs text-orange-700">{stats.vehiculesEnMaintenance} véhicule(s)</p>
              </div>
            </div>
          )}

          {stats.stockFaible === 0 && stats.congesEnAttente === 0 && stats.commandesEnAttente === 0 && stats.vehiculesEnMaintenance === 0 && (
            <div className="col-span-full flex items-center justify-center p-8 bg-green-50 rounded-lg">
              <div className="text-center">
                <CheckCircle className="mx-auto text-green-600 mb-2" size={48} />
                <p className="text-sm font-medium text-green-900">Tout est en ordre !</p>
                <p className="text-xs text-green-700">Aucune alerte active</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de détails */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {modalType === 'commandes' && '📦 Commandes du jour'}
                {modalType === 'presences' && '👥 Présences du jour'}
                {modalType === 'stock' && '⚠️ Articles en stock faible'}
                {modalType === 'vehicules' && '🔧 Véhicules en maintenance'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {modalData.length > 0 ? (
                modalData.map((item, index) => (
                  <div key={item.id || index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                    {modalType === 'commandes' && (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {item.description || 'Sans description'}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <span>🏢 {item.service}</span>
                            <span>👤 {item.createdByName}</span>
                            {item.prix && (
                              <span className="font-medium text-green-600">
                                💰 {new Intl.NumberFormat('fr-FR').format(item.prix)} GNF
                              </span>
                            )}
                            <span>
                              🕐 {item.createdAt?.toDate?.()?.toLocaleString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              }) || 'N/A'}
                            </span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          item.statut === 'approuve' ? 'bg-green-100 text-green-800' :
                          item.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-800' :
                          item.statut === 'rejete' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.statut?.replace('_', ' ').toUpperCase() || 'N/A'}
                        </span>
                      </div>
                    )}

                    {modalType === 'presences' && (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {item.employeData ? (
                              `${item.employeData.nom} ${item.employeData.prenom || ''}`.trim()
                            ) : (
                              `Employé ID: ${item.employeId}`
                            )}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            {item.employeData?.poste && (
                              <span>💼 {item.employeData.poste}</span>
                            )}
                            <span>🕐 Arrivée: {item.heureArrivee || 'N/A'}</span>
                            <span>🕐 Départ: {item.heureDepart || 'Non pointé'}</span>
                            <span>📅 {item.date?.toDate?.()?.toLocaleDateString('fr-FR') || 'N/A'}</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          item.statut === 'present' ? 'bg-green-100 text-green-800' :
                          item.statut === 'absent' ? 'bg-red-100 text-red-800' :
                          item.statut === 'retard' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.statut?.toUpperCase() || 'N/A'}
                        </span>
                      </div>
                    )}

                    {modalType === 'stock' && (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {item.nom || item.description || 'Article sans nom'}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <span>📦 Stock actuel: {item.quantite || 0}</span>
                            <span>⚠️ Seuil minimum: {item.seuilMin || 10}</span>
                            <span>🏢 Fournisseur: {item.fournisseur || 'N/A'}</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          (item.quantite || 0) <= (item.seuilMin || 10) ? 'bg-red-100 text-red-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {(item.quantite || 0) <= (item.seuilMin || 10) ? 'STOCK FAIBLE' : 'NORMAL'}
                        </span>
                      </div>
                    )}

                    {modalType === 'vehicules' && (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {item.marque} {item.modele} - {item.immatriculation}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <span>🔧 Type: {item.typeMaintenance || 'Maintenance générale'}</span>
                            <span>🏢 Prestataire: {item.prestataire || 'N/A'}</span>
                            <span>📅 Début: {item.dateDebut?.toDate?.()?.toLocaleDateString('fr-FR') || 'N/A'}</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          item.statut === 'en_maintenance' ? 'bg-orange-100 text-orange-800' :
                          item.statut === 'termine' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.statut?.replace('_', ' ').toUpperCase() || 'N/A'}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    {modalType === 'commandes' && <ShoppingCart size={48} />}
                    {modalType === 'presences' && <Users size={48} />}
                    {modalType === 'stock' && <Package size={48} />}
                    {modalType === 'vehicules' && <Car size={48} />}
                  </div>
                  <p className="text-gray-500">
                    {modalType === 'commandes' && 'Aucune commande aujourd\'hui'}
                    {modalType === 'presences' && 'Aucune présence aujourd\'hui'}
                    {modalType === 'stock' && 'Aucun article en stock faible'}
                    {modalType === 'vehicules' && 'Aucun véhicule en maintenance'}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewDashboard;
