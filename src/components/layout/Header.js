import React, { useState, useEffect } from 'react';
import { Bell, Search, Menu, LogOut, User, Settings } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import NotificationCenter from '../notifications/NotificationCenter';
import ThemeToggle from '../theme/ThemeToggle';
import '../../styles/animations.css';

const Header = ({ onMenuClick }) => {
  const { userProfile, logout } = useAuth();
  const { isDark } = useTheme();
  const [hasAlerts, setHasAlerts] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);

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

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <header className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 mr-2"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className={`text-lg sm:text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Tableau de bord
            </h2>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Barre de recherche - masquée sur mobile */}
            <div className="relative hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher..."
                className={`block w-64 pl-10 pr-3 py-2 border rounded-md leading-5 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                }`}
              />
            </div>
            
            {/* Centre de notifications */}
            <div className="hidden sm:block">
              <NotificationCenter />
            </div>
            
            {/* Bouton de basculement de thème */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {/* Menu utilisateur */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {userProfile?.nom || 'Utilisateur'}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {userProfile?.role || 'Rôle'}
                  </p>
                </div>
              </button>

              {/* Menu déroulant utilisateur */}
              {showUserMenu && (
                <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-50 ${
                  isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                }`}>
                  <div className={`px-4 py-2 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {userProfile?.nom || 'Utilisateur'}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {userProfile?.email || ''}
                    </p>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
