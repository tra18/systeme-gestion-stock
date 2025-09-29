import React, { useState, useEffect } from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import '../../styles/animations.css';

const Header = ({ onMenuClick }) => {
  const [hasAlerts, setHasAlerts] = useState(false);
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    const checkAlerts = async () => {
      try {
        // Vérifier les commandes en attente
        const commandesQuery = query(
          collection(db, 'commandes'),
          where('statut', 'in', ['en_attente_prix', 'en_attente_approbation'])
        );
        const commandesSnapshot = await getDocs(commandesQuery);
        
        // Vérifier les maintenances à venir (dans les 7 prochains jours)
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const maintenanceQuery = query(
          collection(db, 'maintenance'),
          where('dateProchaine', '>=', today),
          where('dateProchaine', '<=', nextWeek)
        );
        const maintenanceSnapshot = await getDocs(maintenanceQuery);
        
        // Vérifier le stock bas
        const stockQuery = query(
          collection(db, 'stock'),
          where('quantite', '<=', 5)
        );
        const stockSnapshot = await getDocs(stockQuery);
        
        const totalAlerts = commandesSnapshot.size + maintenanceSnapshot.size + stockSnapshot.size;
        
        setAlertCount(totalAlerts);
        setHasAlerts(totalAlerts > 0);
      } catch (error) {
        console.error('Erreur lors de la vérification des alertes:', error);
      }
    };

    checkAlerts();
    
    // Vérifier les alertes toutes les 30 secondes
    const interval = setInterval(checkAlerts, 30000);
    
    return () => clearInterval(interval);
  }, []);
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 mr-2"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Tableau de bord
            </h2>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="relative hidden sm:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
            
            <button className="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-full">
              <Bell className={`h-5 w-5 sm:h-6 sm:w-6 ${hasAlerts ? 'alert-blink alert-pulse-red' : ''}`} />
              {hasAlerts && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white alert-bounce">
                  {alertCount > 9 ? '9+' : alertCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
