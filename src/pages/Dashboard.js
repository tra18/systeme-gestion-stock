import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Car, 
  AlertTriangle, 
  TrendingUp,
  Package,
  Users,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  TrendingDown,
  Activity,
  Building2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState({
    // Commandes
    totalCommandes: 0,
    commandesEnAttente: 0,
    commandesEnAttenteprix: 0,
    commandesEnAttenteApprobation: 0,
    commandesApprouvees: 0,
    commandesRejetees: 0,
    commandesAujourdhui: 0,
    // Stock & Articles
    totalArticles: 0,
    articlesStockFaible: 0,
    sortiesStock: 0,
    // Maintenance
    totalVehicules: 0,
    vehiculesEnMaintenance: 0,
    maintenancesTerminees: 0,
    maintenancesCeMois: 0,
    // RH
    totalEmployes: 0,
    employesActifs: 0,
    congesEnAttente: 0,
    presencesAujourdhui: 0,
    // Fournisseurs
    totalFournisseurs: 0,
    totalPrestataires: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentCommandes, setRecentCommandes] = useState([]);
  const [recentMaintenance, setRecentMaintenance] = useState([]);
  const [activitesRecentes, setActivitesRecentes] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, [userProfile]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Charger toutes les données en parallèle
      const [
        commandesSnap,
        maintenanceSnap,
        stockSnap,
        articlesSnap,
        employesSnap,
        congesSnap,
        presencesSnap,
        fournisseursSnap,
        prestatairesSnap,
        sortiesStockSnap
      ] = await Promise.all([
        getDocs(collection(db, 'commandes')),
        getDocs(collection(db, 'maintenance')),
        getDocs(collection(db, 'stock')),
        getDocs(collection(db, 'articles')),
        getDocs(collection(db, 'employes')),
        getDocs(collection(db, 'conges')),
        getDocs(collection(db, 'presences')),
        getDocs(collection(db, 'fournisseurs')),
        getDocs(collection(db, 'prestataires')),
        getDocs(collection(db, 'sorties_stock'))
      ]);

      const commandes = commandesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const maintenance = maintenanceSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const stock = stockSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const articles = articlesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const employes = employesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const conges = congesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const presences = presencesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const fournisseurs = fournisseursSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const prestataires = prestatairesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const sortiesStock = sortiesStockSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // Calculer toutes les statistiques
      const newStats = {
        // Commandes
        totalCommandes: commandes.length,
        commandesEnAttente: commandes.filter(c => c.statut === 'en_attente').length,
        commandesEnAttenteprix: commandes.filter(c => c.statut === 'en_attente_prix').length,
        commandesEnAttenteApprobation: commandes.filter(c => c.statut === 'en_attente_approbation').length,
        commandesApprouvees: commandes.filter(c => c.statut === 'approuve').length,
        commandesRejetees: commandes.filter(c => c.statut === 'rejete').length,
        commandesAujourdhui: commandes.filter(c => {
          const date = c.createdAt?.toDate?.();
          return date && date >= today;
        }).length,
        // Stock & Articles
        totalArticles: articles.length,
        articlesStockFaible: stock.filter(s => s.quantite < (s.seuilAlerte || 10)).length,
        sortiesStock: sortiesStock.length,
        // Maintenance
        totalVehicules: maintenance.length,
        vehiculesEnMaintenance: maintenance.filter(m => m.statut === 'en_cours').length,
        maintenancesTerminees: maintenance.filter(m => m.statut === 'termine').length,
        maintenancesCeMois: maintenance.filter(m => {
          const date = m.createdAt?.toDate?.();
          return date && date >= startOfMonth;
        }).length,
        // RH
        totalEmployes: employes.length,
        employesActifs: employes.filter(e => e.statut === 'actif').length,
        congesEnAttente: conges.filter(c => c.statut === 'en_attente').length,
        presencesAujourdhui: presences.filter(p => {
          const date = p.date?.toDate?.();
          return date && date >= today;
        }).length,
        // Fournisseurs
        totalFournisseurs: fournisseurs.length,
        totalPrestataires: prestataires.length
      };

      setStats(newStats);

      // Trier et prendre les 5 commandes les plus récentes
      const sortedCommandes = [...commandes].sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
      setRecentCommandes(sortedCommandes.slice(0, 5));

      // Trier et prendre les 5 maintenances les plus récentes
      const sortedMaintenance = [...maintenance].sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
      setRecentMaintenance(sortedMaintenance.slice(0, 5));

      // Créer un fil d'activités récentes
      const activites = [];
      
      // Ajouter les dernières commandes
      sortedCommandes.slice(0, 3).forEach(cmd => {
        activites.push({
          type: 'commande',
          icon: ShoppingCart,
          color: 'blue',
          titre: 'Nouvelle commande',
          description: `${cmd.description?.substring(0, 50)}...`,
          auteur: cmd.createdByName,
          date: cmd.createdAt?.toDate?.()
        });
      });

      // Ajouter les dernières maintenances
      sortedMaintenance.slice(0, 2).forEach(maint => {
        activites.push({
          type: 'maintenance',
          icon: Car,
          color: 'orange',
          titre: 'Maintenance véhicule',
          description: `${maint.vehicule} - ${maint.type}`,
          auteur: maint.prestataire,
          date: maint.createdAt?.toDate?.()
        });
      });

      // Trier par date
      activites.sort((a, b) => (b.date || new Date(0)) - (a.date || new Date(0)));
      setActivitesRecentes(activites.slice(0, 6));

    } catch (error) {
      console.error('Erreur lors du chargement du tableau de bord:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'en_attente': return 'status-pending';
      case 'en_cours': return 'status-in-progress';
      case 'approuve': return 'status-approved';
      case 'rejete': return 'status-rejected';
      case 'termine': return 'status-approved';
      default: return 'status-pending';
    }
  };

  const getStatutText = (statut) => {
    switch (statut) {
      case 'en_attente': return 'En attente';
      case 'en_cours': return 'En cours';
      case 'approuve': return 'Approuvé';
      case 'rejete': return 'Rejeté';
      case 'termine': return 'Terminé';
      default: return statut;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* En-tête avec date et heure */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
      <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bonjour, {userProfile?.nom || 'Utilisateur'} 👋
        </h1>
          <p className="mt-1 text-sm text-gray-600 flex items-center space-x-2">
            <Calendar size={16} />
            <span>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadDashboardData}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            <Activity size={20} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Statistiques principales - Vue d'ensemble */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Commandes */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Commandes</p>
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
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Employés</p>
              <p className="text-4xl font-bold mt-2">{stats.totalEmployes}</p>
              <p className="text-green-100 text-xs mt-2">
                {stats.employesActifs} actifs
              </p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <Users size={32} />
            </div>
          </div>
        </div>

        {/* Articles en stock */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Articles</p>
              <p className="text-4xl font-bold mt-2">{stats.totalArticles}</p>
              <p className="text-purple-100 text-xs mt-2 flex items-center space-x-1">
                <AlertTriangle size={12} />
                <span>{stats.articlesStockFaible} en stock faible</span>
              </p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <Package size={32} />
            </div>
          </div>
        </div>

        {/* Maintenance */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all">
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

      {/* Workflow des commandes */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">📋 Workflow des Commandes</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="bg-gray-100 rounded-lg p-4 mb-2">
              <Clock className="mx-auto text-gray-600 mb-2" size={32} />
              <p className="text-3xl font-bold text-gray-900">{stats.commandesEnAttente}</p>
            </div>
            <p className="text-sm text-gray-600 font-medium">En attente</p>
            <p className="text-xs text-gray-400">Créées par services</p>
          </div>

          <div className="text-center">
            <div className="bg-yellow-50 rounded-lg p-4 mb-2 border-2 border-yellow-200">
              <DollarSign className="mx-auto text-yellow-600 mb-2" size={32} />
              <p className="text-3xl font-bold text-yellow-700">{stats.commandesEnAttenteprix}</p>
            </div>
            <p className="text-sm text-gray-600 font-medium">Attente prix</p>
            <p className="text-xs text-gray-400">Service achat</p>
          </div>

          <div className="text-center">
            <div className="bg-purple-50 rounded-lg p-4 mb-2 border-2 border-purple-200">
              <CheckCircle className="mx-auto text-purple-600 mb-2" size={32} />
              <p className="text-3xl font-bold text-purple-700">{stats.commandesEnAttenteApprobation}</p>
            </div>
            <p className="text-sm text-gray-600 font-medium">Validation DG</p>
            <p className="text-xs text-gray-400">À approuver</p>
          </div>

          <div className="text-center">
            <div className="bg-green-50 rounded-lg p-4 mb-2 border-2 border-green-200">
              <CheckCircle className="mx-auto text-green-600 mb-2" size={32} />
              <p className="text-3xl font-bold text-green-700">{stats.commandesApprouvees}</p>
            </div>
            <p className="text-sm text-gray-600 font-medium">Approuvées</p>
            <p className="text-xs text-gray-400">Validées</p>
          </div>

          <div className="text-center">
            <div className="bg-red-50 rounded-lg p-4 mb-2 border-2 border-red-200">
              <XCircle className="mx-auto text-red-600 mb-2" size={32} />
              <p className="text-3xl font-bold text-red-700">{stats.commandesRejetees}</p>
            </div>
            <p className="text-sm text-gray-600 font-medium">Rejetées</p>
            <p className="text-xs text-gray-400">Refusées</p>
          </div>
        </div>
      </div>

      {/* Statistiques RH et Partenaires */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-gray-900">👥 Ressources Humaines</h4>
            <Users className="text-blue-600" size={24} />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Employés actifs</span>
              <span className="text-lg font-bold text-gray-900">{stats.employesActifs}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Présents aujourd'hui</span>
              <span className="text-lg font-bold text-green-600">{stats.presencesAujourdhui}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Congés en attente</span>
              <span className="text-lg font-bold text-yellow-600">{stats.congesEnAttente}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-gray-900">📦 Stock & Articles</h4>
            <Package className="text-purple-600" size={24} />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total articles</span>
              <span className="text-lg font-bold text-gray-900">{stats.totalArticles}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Stock faible</span>
              <span className="text-lg font-bold text-red-600">{stats.articlesStockFaible}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Sorties ce mois</span>
              <span className="text-lg font-bold text-orange-600">{stats.sortiesStock}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-gray-900">🤝 Partenaires</h4>
            <Building2 className="text-indigo-600" size={24} />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Fournisseurs</span>
              <span className="text-lg font-bold text-gray-900">{stats.totalFournisseurs}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Prestataires</span>
              <span className="text-lg font-bold text-gray-900">{stats.totalPrestataires}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total</span>
              <span className="text-lg font-bold text-indigo-600">{stats.totalFournisseurs + stats.totalPrestataires}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activités récentes et Commandes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activités récentes */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">🔔 Activités récentes</h3>
            <Activity className="text-gray-400" size={20} />
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activitesRecentes.length > 0 ? (
              activitesRecentes.map((activite, index) => {
                const Icon = activite.icon;
                const colorClasses = {
                  blue: 'bg-blue-100 text-blue-600',
                  orange: 'bg-orange-100 text-orange-600',
                  green: 'bg-green-100 text-green-600',
                  purple: 'bg-purple-100 text-purple-600'
                };
                
                return (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${colorClasses[activite.color]} flex items-center justify-center`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activite.titre}</p>
                      <p className="text-xs text-gray-600 truncate">{activite.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {activite.date?.toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' }) || 'N/A'}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">Aucune activité récente</p>
            )}
          </div>
        </div>

        {/* Commandes récentes */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">📦 Commandes récentes</h3>
            <a href="/commandes" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1">
              <span>Voir tout</span>
              <ArrowUpRight size={16} />
            </a>
          </div>
          <div className="space-y-3">
            {recentCommandes.length > 0 ? (
              recentCommandes.map((commande) => (
                <div key={commande.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:shadow-md transition border border-gray-200">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {commande.description?.substring(0, 60) || 'Sans description'}
                      </p>
                      {commande.articles && commande.articles.length > 0 && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                          {commande.articles.length} art.
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span>🏢 {commande.service}</span>
                      {commande.prix && (
                        <span className="font-medium text-green-600">💰 {new Intl.NumberFormat('fr-FR').format(commande.prix)} GNF</span>
                      )}
                      <span>👤 {commande.createdByName}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                    commande.statut === 'approuve' ? 'bg-green-100 text-green-800' :
                    commande.statut === 'en_attente_approbation' ? 'bg-purple-100 text-purple-800' :
                    commande.statut === 'en_attente_prix' ? 'bg-yellow-100 text-yellow-800' :
                    commande.statut === 'rejete' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getStatutText(commande.statut)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">Aucune commande récente</p>
            )}
          </div>
          </div>
        </div>

      {/* Maintenance et Alertes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenance récente */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">🔧 Maintenance récente</h3>
            <a href="/maintenance" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1">
              <span>Voir tout</span>
              <ArrowUpRight size={16} />
            </a>
          </div>
          <div className="space-y-3">
            {recentMaintenance.length > 0 ? (
              recentMaintenance.map((maintenance) => (
                <div key={maintenance.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:shadow-md transition border border-gray-200">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Car className="text-orange-600" size={20} />
                    </div>
                  <div>
                      <p className="text-sm font-semibold text-gray-900">
                      {maintenance.vehicule}
                    </p>
                      <p className="text-xs text-gray-600">
                      {maintenance.type} • {maintenance.prestataire}
                    </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {maintenance.createdAt?.toDate?.()?.toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                    maintenance.statut === 'termine' ? 'bg-green-100 text-green-800' :
                    maintenance.statut === 'en_cours' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getStatutText(maintenance.statut)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">Aucune maintenance récente</p>
            )}
          </div>
        </div>

        {/* Alertes et notifications */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">⚠️ Alertes</h3>
            <AlertTriangle className="text-orange-500" size={24} />
          </div>
          <div className="space-y-4">
            {stats.articlesStockFaible > 0 && (
              <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                <AlertTriangle className="text-red-600 flex-shrink-0" size={20} />
                <div>
                  <p className="text-sm font-semibold text-red-900">Stock faible</p>
                  <p className="text-xs text-red-700">{stats.articlesStockFaible} article(s) nécessitent un réapprovisionnement</p>
                </div>
              </div>
            )}
            
            {stats.congesEnAttente > 0 && (
              <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                <Calendar className="text-yellow-600 flex-shrink-0" size={20} />
                <div>
                  <p className="text-sm font-semibold text-yellow-900">Congés en attente</p>
                  <p className="text-xs text-yellow-700">{stats.congesEnAttente} demande(s) à traiter</p>
                </div>
              </div>
            )}

            {stats.commandesEnAttenteApprobation > 0 && (
              <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                <CheckCircle className="text-purple-600 flex-shrink-0" size={20} />
                <div>
                  <p className="text-sm font-semibold text-purple-900">Validation requise</p>
                  <p className="text-xs text-purple-700">{stats.commandesEnAttenteApprobation} commande(s) à valider</p>
                </div>
              </div>
            )}

            {stats.vehiculesEnMaintenance > 0 && (
              <div className="flex items-start space-x-3 p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                <Car className="text-orange-600 flex-shrink-0" size={20} />
                <div>
                  <p className="text-sm font-semibold text-orange-900">Véhicules en maintenance</p>
                  <p className="text-xs text-orange-700">{stats.vehiculesEnMaintenance} véhicule(s) en cours de maintenance</p>
                </div>
              </div>
            )}

            {stats.articlesStockFaible === 0 && stats.congesEnAttente === 0 && stats.commandesEnAttenteApprobation === 0 && stats.vehiculesEnMaintenance === 0 && (
              <div className="flex items-center justify-center p-8 bg-green-50 rounded-lg">
                <div className="text-center">
                  <CheckCircle className="mx-auto text-green-600 mb-2" size={48} />
                  <p className="text-sm font-medium text-green-900">Tout est en ordre !</p>
                  <p className="text-xs text-green-700">Aucune alerte active</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
