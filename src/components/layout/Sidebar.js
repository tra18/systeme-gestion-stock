import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Car, 
  Users, 
  Building2, 
  Wrench,
  LogOut,
  Bell,
  Settings,
  Package,
  Plus,
  DollarSign,
  UserCheck,
  Building,
  Hash,
  X,
  BarChart3,
  Monitor,
  Wifi,
  Briefcase,
  FileText,
  Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const Sidebar = ({ onClose, isOpen }) => {
  const location = useLocation();
  const { userProfile, logout } = useAuth();
  const { isDark } = useTheme();

  const navigation = [
    { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard, roles: ['service', 'achat', 'dg'] },
    { name: 'Nouvelle Commande', href: '/nouvelle-commande', icon: Plus, roles: ['service', 'dg'] },
    { name: 'Achat', href: '/service-achat', icon: DollarSign, roles: ['achat', 'dg'] },
    { name: 'Validation DG', href: '/validation-dg', icon: UserCheck, roles: ['dg'] },
    { name: 'Commandes', href: '/commandes', icon: ShoppingCart, roles: ['service', 'achat', 'dg'] },
    { name: 'Maintenance', href: '/maintenance', icon: Car, roles: ['service', 'achat', 'dg'] },
    { name: 'Stock', href: '/stock', icon: Package, roles: ['service', 'achat', 'dg'] },
    { name: 'Articles', href: '/articles', icon: Hash, roles: ['service', 'achat', 'dg'] },
    { name: 'Services', href: '/services', icon: Building, roles: ['dg'] },
    { name: 'Ressources Humaines', href: '/ressources-humaines', icon: Briefcase, roles: ['dg'] },
    { name: 'Gestion IT', href: '/gestion-it', icon: Monitor, roles: ['dg'] },
    { name: 'Budgets', href: '/budgets', icon: DollarSign, roles: ['dg'] },
    { name: 'Rapports', href: '/rapports', icon: FileText, roles: ['dg'] },
    { name: 'Fournisseurs', href: '/fournisseurs', icon: Building2, roles: ['achat', 'dg'] },
    { name: 'Prestataires', href: '/prestataires', icon: Wrench, roles: ['achat', 'dg'] },
    { name: 'Alertes', href: '/alertes', icon: Bell, roles: ['service', 'achat', 'dg'] },
    { name: 'Paramètres', href: '/parametres', icon: Settings, roles: ['dg'] },
    { name: 'Gestion Permissions', href: '/gestion-permissions', icon: Shield, roles: ['dg'] },
  ];

  // Nouvelles pages avancées (uniquement pour le DG)
  const advancedNavigation = [
    { name: 'Dashboard Avancé', href: '/dashboard-avance', icon: BarChart3, roles: ['dg'] },
    { name: 'Mode Hors Ligne', href: '/hors-ligne', icon: Wifi, roles: ['dg'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(userProfile?.role)
  );

  const filteredAdvancedNavigation = advancedNavigation.filter(item => 
    item.roles.includes(userProfile?.role)
  );

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    }
  };

  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <div className={`flex flex-col w-64 bg-white shadow-lg h-full fixed lg:relative z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
      <div className="flex items-center justify-between h-16 px-4 bg-primary-600">
        <div className="flex items-center space-x-3">
          <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg border-2 border-white/20 overflow-hidden p-2 logo-container">
            <img 
              src="/images/logo.svg" 
              alt="Logo Gestion Pro" 
              className="logo-image"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <span className="logo-fallback hidden">G</span>
          </div>
          <h1 className="text-xl font-bold text-white">Gestion Pro</h1>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>
      
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`${
                  isActive
                    ? 'bg-primary-100 text-primary-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200`}
              >
                <item.icon
                  className={`${
                    isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                  } mr-3 flex-shrink-0 h-5 w-5`}
                />
                {item.name}
              </Link>
            );
          })}
          
          {/* Section des fonctionnalités avancées */}
          {filteredAdvancedNavigation.length > 0 && (
            <>
              <div className="border-t border-gray-200 my-4"></div>
              <div className="px-2 mb-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Fonctionnalités Avancées
                </h3>
              </div>
              {filteredAdvancedNavigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActive
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200`}
                  >
                    <item.icon
                      className={`${
                        isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 flex-shrink-0 h-5 w-5`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </>
          )}
        </nav>
      </div>
      
      <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">
              {userProfile?.nom} {userProfile?.prenom}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {userProfile?.role}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="ml-auto p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          title="Déconnexion"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
      </div>
    </>
  );
};

export default Sidebar;
