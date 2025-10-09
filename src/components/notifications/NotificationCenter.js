import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info, TrendingUp, Calendar, DollarSign, Package } from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';

const NotificationCenter = () => {
  const { userProfile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (userProfile?.uid) {
      loadNotifications();
      setupRealtimeListener();
    }
  }, [userProfile]);

  const loadNotifications = async () => {
    try {
      // Générer des notifications basées sur les données
      const notifs = [];
      
      // Notifications pour commandes
      const commandesSnap = await getDocs(collection(db, 'commandes'));
      const commandes = commandesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (userProfile?.role === 'achat') {
        const commandesEnAttentePrix = commandes.filter(c => c.statut === 'en_attente_prix');
        commandesEnAttentePrix.forEach(cmd => {
          notifs.push({
            id: `cmd-prix-${cmd.id}`,
            type: 'action',
            icon: DollarSign,
            color: 'yellow',
            titre: 'Prix à ajouter',
            message: `Commande de ${cmd.service} en attente de prix`,
            lien: '/service-achat',
            date: cmd.createdAt?.toDate?.() || new Date(),
            lu: false
          });
        });
      }
      
      if (userProfile?.role === 'dg') {
        const commandesEnAttenteApprobation = commandes.filter(c => c.statut === 'en_attente_approbation');
        commandesEnAttenteApprobation.forEach(cmd => {
          notifs.push({
            id: `cmd-valid-${cmd.id}`,
            type: 'action',
            icon: CheckCircle,
            color: 'purple',
            titre: 'Validation requise',
            message: `Commande de ${cmd.service} (${cmd.prix ? new Intl.NumberFormat('fr-FR').format(cmd.prix) + ' GNF' : 'N/A'})`,
            lien: '/validation-dg',
            date: cmd.updatedAt?.toDate?.() || cmd.createdAt?.toDate?.() || new Date(),
            lu: false
          });
        });
        
        // Notifications stock faible
        const stockSnap = await getDocs(collection(db, 'stock'));
        const stock = stockSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const stockFaible = stock.filter(s => s.quantite < (s.seuilAlerte || 10));
        
        if (stockFaible.length > 0) {
          notifs.push({
            id: 'stock-faible',
            type: 'alert',
            icon: AlertCircle,
            color: 'red',
            titre: 'Stock faible',
            message: `${stockFaible.length} article(s) nécessitent un réapprovisionnement`,
            lien: '/stock',
            date: new Date(),
            lu: false
          });
        }
        
        // Notifications congés RH
        const congesSnap = await getDocs(collection(db, 'conges'));
        const conges = congesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const congesEnAttente = conges.filter(c => c.statut === 'en_attente');
        
        congesEnAttente.forEach(conge => {
          notifs.push({
            id: `conge-${conge.id}`,
            type: 'action',
            icon: Calendar,
            color: 'blue',
            titre: 'Demande de congé',
            message: `Demande de congé en attente de validation`,
            lien: '/ressources-humaines',
            date: conge.createdAt?.toDate?.() || new Date(),
            lu: false
          });
        });
      }
      
      // Trier par date (plus récent en premier)
      notifs.sort((a, b) => b.date - a.date);
      
      setNotifications(notifs.slice(0, 10)); // Limiter à 10 notifications
      setUnreadCount(notifs.filter(n => !n.lu).length);
      
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    }
  };

  const setupRealtimeListener = () => {
    // Écouter les changements en temps réel sur les commandes
    const unsubscribe = onSnapshot(collection(db, 'commandes'), (snapshot) => {
      loadNotifications(); // Recharger les notifications
    });
    
    return unsubscribe;
  };

  const markAsRead = (notifId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notifId ? { ...n, lu: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
    setUnreadCount(0);
  };

  const getColorClasses = (color) => {
    const colors = {
      yellow: 'bg-yellow-100 text-yellow-600',
      purple: 'bg-purple-100 text-purple-600',
      red: 'bg-red-100 text-red-600',
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600'
    };
    return colors[color] || 'bg-gray-100 text-gray-600';
  };

  const formatDate = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="relative">
      {/* Bouton cloche */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel de notifications */}
      {showPanel && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
          {/* En-tête */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <div>
              <h3 className="font-bold text-gray-900">Notifications</h3>
              <p className="text-xs text-gray-600">{unreadCount} non lue(s)</p>
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Tout marquer lu
                </button>
              )}
              <button
                onClick={() => setShowPanel(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Liste des notifications */}
          <div className="overflow-y-auto flex-1">
            {notifications.length > 0 ? (
              notifications.map(notif => {
                const Icon = notif.icon;
                return (
                  <a
                    key={notif.id}
                    href={notif.lien}
                    onClick={() => {
                      markAsRead(notif.id);
                      setShowPanel(false);
                    }}
                    className={`block p-4 border-b border-gray-100 hover:bg-gray-50 transition ${
                      !notif.lu ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${getColorClasses(notif.color)} flex items-center justify-center`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-semibold ${!notif.lu ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notif.titre}
                          </p>
                          {!notif.lu && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(notif.date)}</p>
                      </div>
                    </div>
                  </a>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Bell className="text-gray-300 mb-3" size={48} />
                <p className="text-gray-500 font-medium">Aucune notification</p>
                <p className="text-xs text-gray-400">Vous êtes à jour !</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium">
                Voir toutes les notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;

