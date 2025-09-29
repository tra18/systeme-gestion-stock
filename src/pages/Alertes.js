import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  ShoppingCart, 
  Car, 
  Clock, 
  TrendingDown,
  Calendar,
  Bell,
  CheckCircle
} from 'lucide-react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';

const Alertes = () => {
  const [alertes, setAlertes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('toutes');

  useEffect(() => {
    loadAlertes();
  }, []);

  const loadAlertes = async () => {
    try {
      const [commandesSnapshot, maintenanceSnapshot] = await Promise.all([
        getDocs(collection(db, 'commandes')),
        getDocs(collection(db, 'maintenance'))
      ]);

      const commandes = commandesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const maintenance = maintenanceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const alertesData = [];

      // Alertes de stock bas
      commandes.forEach(commande => {
        if (commande.quantite && commande.quantite < 10) {
          alertesData.push({
            id: `stock-${commande.id}`,
            type: 'stock',
            titre: 'Stock bas',
            description: `Le stock de "${commande.article}" est bas (${commande.quantite} unités)`,
            priorite: commande.quantite < 5 ? 'critique' : 'moyenne',
            date: commande.createdAt,
            data: commande,
            statut: 'active'
          });
        }
      });

      // Alertes de maintenance
      const maintenant = new Date();
      maintenance.forEach(maint => {
        if (maint.dateEntretien && maint.statut !== 'termine') {
          const dateEntretien = maint.dateEntretien.toDate ? maint.dateEntretien.toDate() : new Date(maint.dateEntretien);
          const joursRestants = differenceInDays(dateEntretien, maintenant);
          
          if (joursRestants <= 7) {
            alertesData.push({
              id: `maintenance-${maint.id}`,
              type: 'maintenance',
              titre: 'Entretien proche',
              description: `Entretien de "${maint.vehicule}" prévu dans ${joursRestants} jour(s)`,
              priorite: joursRestants <= 3 ? 'critique' : joursRestants <= 7 ? 'moyenne' : 'faible',
              date: maint.dateEntretien,
              data: maint,
              statut: 'active'
            });
          }
        }
      });

      // Alertes de commandes en attente
      commandes.forEach(commande => {
        const joursEnAttente = differenceInDays(maintenant, commande.createdAt.toDate());
        
        if (commande.statut === 'en_attente' && joursEnAttente >= 3) {
          alertesData.push({
            id: `commande-${commande.id}`,
            type: 'commande',
            titre: 'Commande en attente',
            description: `La commande "${commande.article}" attend un prix depuis ${joursEnAttente} jour(s)`,
            priorite: joursEnAttente >= 7 ? 'critique' : 'moyenne',
            date: commande.createdAt,
            data: commande,
            statut: 'active'
          });
        }
      });

      // Trier par priorité et date
      alertesData.sort((a, b) => {
        const prioriteOrder = { critique: 3, moyenne: 2, faible: 1 };
        if (prioriteOrder[a.priorite] !== prioriteOrder[b.priorite]) {
          return prioriteOrder[b.priorite] - prioriteOrder[a.priorite];
        }
        return new Date(b.date) - new Date(a.date);
      });

      setAlertes(alertesData);
    } catch (error) {
      console.error('Erreur lors du chargement des alertes:', error);
      toast.error('Erreur lors du chargement des alertes');
    } finally {
      setLoading(false);
    }
  };

  const handleMarquerCommeLue = async (alerteId) => {
    try {
      // Ici on pourrait ajouter une collection 'alertes' pour marquer comme lues
      // Pour l'instant, on filtre simplement l'alerte
      setAlertes(prev => prev.filter(alerte => alerte.id !== alerteId));
      toast.success('Alerte marquée comme lue');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const filteredAlertes = alertes.filter(alerte => 
    filterType === 'toutes' || alerte.type === filterType
  );

  const getPrioriteColor = (priorite) => {
    switch (priorite) {
      case 'critique': return 'bg-danger-100 text-danger-800 border-danger-200';
      case 'moyenne': return 'bg-warning-100 text-warning-800 border-warning-200';
      case 'faible': return 'bg-primary-100 text-primary-800 border-primary-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'stock': return <TrendingDown className="h-5 w-5" />;
      case 'maintenance': return <Car className="h-5 w-5" />;
      case 'commande': return <ShoppingCart className="h-5 w-5" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'stock': return 'text-danger-600';
      case 'maintenance': return 'text-warning-600';
      case 'commande': return 'text-primary-600';
      default: return 'text-gray-600';
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Centre d'Alertes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Surveillez les alertes importantes de votre organisation
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-primary-600" />
          <span className="text-sm font-medium text-gray-900">
            {alertes.length} alerte{alertes.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-danger-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Critiques</p>
              <p className="text-2xl font-semibold text-gray-900">
                {alertes.filter(a => a.priorite === 'critique').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingDown className="h-8 w-8 text-warning-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Stock bas</p>
              <p className="text-2xl font-semibold text-gray-900">
                {alertes.filter(a => a.type === 'stock').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Car className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Maintenance</p>
              <p className="text-2xl font-semibold text-gray-900">
                {alertes.filter(a => a.type === 'maintenance').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-gray-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">En attente</p>
              <p className="text-2xl font-semibold text-gray-900">
                {alertes.filter(a => a.type === 'commande').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilterType('toutes')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'toutes'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Toutes
          </button>
          <button
            onClick={() => setFilterType('stock')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'stock'
                ? 'bg-danger-100 text-danger-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Stock
          </button>
          <button
            onClick={() => setFilterType('maintenance')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'maintenance'
                ? 'bg-warning-100 text-warning-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Maintenance
          </button>
          <button
            onClick={() => setFilterType('commande')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'commande'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Commandes
          </button>
        </div>
      </div>

      {/* Liste des alertes */}
      <div className="space-y-4">
        {filteredAlertes.length > 0 ? (
          filteredAlertes.map((alerte) => (
            <div
              key={alerte.id}
              className={`card border-l-4 ${
                alerte.priorite === 'critique' ? 'border-danger-500' :
                alerte.priorite === 'moyenne' ? 'border-warning-500' :
                'border-primary-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 ${getTypeColor(alerte.type)}`}>
                    {getTypeIcon(alerte.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-gray-900">
                        {alerte.titre}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPrioriteColor(alerte.priorite)}`}>
                        {alerte.priorite}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {alerte.description}
                    </p>
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(alerte.date.toDate ? alerte.date.toDate() : new Date(alerte.date), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleMarquerCommeLue(alerte.id)}
                    className="text-success-600 hover:text-success-900 p-1"
                    title="Marquer comme lue"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <CheckCircle className="mx-auto h-12 w-12 text-success-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune alerte</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filterType === 'toutes' 
                ? 'Tout va bien ! Aucune alerte active.'
                : `Aucune alerte de type "${filterType}" active.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alertes;
