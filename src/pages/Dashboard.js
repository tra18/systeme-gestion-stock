import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Car, 
  AlertTriangle, 
  TrendingUp
} from 'lucide-react';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState({
    commandesEnAttente: 0,
    commandesEnCours: 0,
    vehiculesEnMaintenance: 0,
    alertesStock: 0,
    alertesMaintenance: 0
  });
  const [recentCommandes, setRecentCommandes] = useState([]);
  const [recentMaintenance, setRecentMaintenance] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, [userProfile]);

  const loadDashboardData = async () => {
    try {
      // Charger les statistiques
      const commandesQuery = query(collection(db, 'commandes'));
      const maintenanceQuery = query(collection(db, 'maintenance'));
      
      const [commandesSnapshot, maintenanceSnapshot] = await Promise.all([
        getDocs(commandesQuery),
        getDocs(maintenanceQuery)
      ]);

      const commandes = commandesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const maintenance = maintenanceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculer les statistiques
      const commandesEnAttente = commandes.filter(c => c.statut === 'en_attente').length;
      const commandesEnCours = commandes.filter(c => c.statut === 'en_cours').length;
      const vehiculesEnMaintenance = maintenance.filter(m => m.statut === 'en_cours').length;
      
      // Alertes stock (exemple: stock < 10)
      const alertesStock = commandes.filter(c => c.quantite && c.quantite < 10).length;
      
      // Alertes maintenance (entretiens dans les 7 prochains jours)
      const maintenant = new Date();
      const dans7Jours = new Date(maintenant.getTime() + 7 * 24 * 60 * 60 * 1000);
      const alertesMaintenance = maintenance.filter(m => {
        const dateEntretien = m.dateEntretien?.toDate();
        return dateEntretien && dateEntretien <= dans7Jours && m.statut !== 'termine';
      }).length;

      setStats({
        commandesEnAttente,
        commandesEnCours,
        vehiculesEnMaintenance,
        alertesStock,
        alertesMaintenance
      });

      // Commandes récentes
      const recentCommandesQuery = collection(db, 'commandes');
      const recentCommandesSnapshot = await getDocs(recentCommandesQuery);
      const recentCommandesData = recentCommandesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Trier et limiter côté client
      recentCommandesData.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
      setRecentCommandes(recentCommandesData.slice(0, 5));

      // Maintenance récente
      const recentMaintenanceQuery = collection(db, 'maintenance');
      const recentMaintenanceSnapshot = await getDocs(recentMaintenanceQuery);
      const recentMaintenanceData = recentMaintenanceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Trier et limiter côté client
      recentMaintenanceData.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
      setRecentMaintenance(recentMaintenanceData.slice(0, 5));

    } catch (error) {
      console.error('Erreur lors du chargement du tableau de bord:', error);
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

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour, {userProfile?.prenom} {userProfile?.nom}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Voici un aperçu de votre activité
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShoppingCart className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Commandes en attente
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.commandesEnAttente}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-success-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Commandes en cours
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.commandesEnCours}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Car className="h-8 w-8 text-warning-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Véhicules en maintenance
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.vehiculesEnMaintenance}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-danger-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Alertes actives
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.alertesStock + stats.alertesMaintenance}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Commandes récentes */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Commandes récentes
            </h3>
            <a href="/commandes" className="text-sm text-primary-600 hover:text-primary-500">
              Voir tout
            </a>
          </div>
          <div className="space-y-3">
            {recentCommandes.length > 0 ? (
              recentCommandes.map((commande) => (
                <div key={commande.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {commande.article}
                    </p>
                    <p className="text-xs text-gray-500">
                      {commande.service} • {commande.quantite} unités
                    </p>
                  </div>
                  <span className={`status-badge ${getStatutColor(commande.statut)}`}>
                    {getStatutText(commande.statut)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Aucune commande récente
              </p>
            )}
          </div>
        </div>

        {/* Maintenance récente */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Maintenance récente
            </h3>
            <a href="/maintenance" className="text-sm text-primary-600 hover:text-primary-500">
              Voir tout
            </a>
          </div>
          <div className="space-y-3">
            {recentMaintenance.length > 0 ? (
              recentMaintenance.map((maintenance) => (
                <div key={maintenance.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {maintenance.vehicule}
                    </p>
                    <p className="text-xs text-gray-500">
                      {maintenance.type} • {maintenance.prestataire}
                    </p>
                  </div>
                  <span className={`status-badge ${getStatutColor(maintenance.statut)}`}>
                    {getStatutText(maintenance.statut)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Aucune maintenance récente
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
