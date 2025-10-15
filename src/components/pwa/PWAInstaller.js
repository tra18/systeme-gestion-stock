import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Bell, Wifi, WifiOff } from 'lucide-react';
import toast from 'react-hot-toast';

const PWAInstaller = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notificationPermission, setNotificationPermission] = useState('default');

  useEffect(() => {
    // Vérifier si l'app est déjà installée
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator.standalone);
      
      setIsInstalled(isStandalone || (isIOS && isInStandaloneMode));
    };

    checkInstalled();

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      console.log('PWA: Événement beforeinstallprompt déclenché');
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    // Écouter l'événement appinstalled
    const handleAppInstalled = () => {
      console.log('PWA: Application installée');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      toast.success('🎉 VITACH GUINÉE installé avec succès !');
    };

    // Écouter les changements de connexion
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Vérifier les permissions de notification
    const checkNotificationPermission = async () => {
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
      }
    };

    // Enregistrer les événements
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    checkNotificationPermission();

    // Enregistrer le service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('PWA: Service Worker enregistré avec succès:', registration);
        })
        .catch((error) => {
          console.error('PWA: Erreur lors de l\'enregistrement du Service Worker:', error);
        });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      // Afficher le prompt d'installation
      deferredPrompt.prompt();
      
      // Attendre la réponse de l'utilisateur
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log('PWA: Résultat du prompt d\'installation:', outcome);
      
      if (outcome === 'accepted') {
        toast.success('Installation en cours...');
      } else {
        toast.info('Installation annulée');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('PWA: Erreur lors de l\'installation:', error);
      toast.error('Erreur lors de l\'installation');
    }
  };

  const handleNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Les notifications ne sont pas supportées sur cet appareil');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        toast.success('Notifications activées !');
        
        // Envoyer une notification de test
        new Notification('VITACH GUINÉE', {
          body: 'Notifications activées avec succès !',
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        });
      } else {
        toast.info('Notifications refusées');
      }
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error);
      toast.error('Erreur lors de l\'activation des notifications');
    }
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
  };

  // Ne pas afficher si déjà installé
  if (isInstalled) {
    return (
      <div className="fixed top-4 right-4 z-50">
        {/* Indicateur de statut de connexion */}
        <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
          isOnline 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
          <span>{isOnline ? 'En ligne' : 'Hors ligne'}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Prompt d'installation */}
      {showInstallPrompt && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Smartphone className="h-8 w-8 text-teal-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  Installer VITACH GUINÉE
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Ajoutez l'application à votre écran d'accueil pour un accès rapide et une meilleure expérience.
                </p>
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={handleInstall}
                    className="flex items-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                  >
                    <Download className="h-4 w-4" />
                    <span>Installer</span>
                  </button>
                  <button
                    onClick={dismissInstallPrompt}
                    className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    <X className="h-4 w-4" />
                    <span>Plus tard</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Indicateur de statut */}
      <div className="fixed top-4 right-4 z-50">
        <div className="flex flex-col space-y-2">
          {/* Statut de connexion */}
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
            isOnline 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            <span>{isOnline ? 'En ligne' : 'Hors ligne'}</span>
          </div>

          {/* Bouton notifications */}
          {notificationPermission !== 'granted' && (
            <button
              onClick={handleNotificationPermission}
              className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
            >
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default PWAInstaller;
