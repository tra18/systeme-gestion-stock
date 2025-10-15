import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, CheckCircle, AlertCircle, Video, Square } from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import toast from 'react-hot-toast';

const QRScanner = ({ employes, onClose, onSuccess }) => {
  const [scanning, setScanning] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [lastScan, setLastScan] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [permissionError, setPermissionError] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  // Charger les caméras disponibles
  useEffect(() => {
    requestCameraPermission();
    return () => {
      stopScanning();
    };
  }, []);

  const requestCameraPermission = async () => {
    try {
      // Demander d'abord la permission via navigator.mediaDevices
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Arrêter le stream immédiatement après avoir obtenu la permission
      stream.getTracks().forEach(track => track.stop());
      
      // Maintenant charger les caméras
      setPermissionGranted(true);
      setPermissionError(null);
      loadCameras();
    } catch (error) {
      console.error('Erreur permission caméra:', error);
      setPermissionGranted(false);
      
      if (error.name === 'NotAllowedError') {
        setPermissionError('permission_denied');
        toast.error('Permission de caméra refusée. Veuillez autoriser l\'accès dans les paramètres de votre navigateur.', {
          duration: 6000
        });
      } else if (error.name === 'NotFoundError') {
        setPermissionError('no_camera');
        toast.error('Aucune caméra détectée sur cet appareil');
      } else {
        setPermissionError('unknown');
        toast.error('Erreur d\'accès à la caméra: ' + error.message);
      }
    }
  };

  const loadCameras = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        setCameras(devices);
        // Sélectionner la caméra arrière par défaut (ou la première disponible)
        const backCamera = devices.find(d => d.label.toLowerCase().includes('back')) || devices[0];
        setSelectedCamera(backCamera.id);
      } else {
        setPermissionError('no_camera');
        toast.error('Aucune caméra trouvée');
      }
    } catch (error) {
      console.error('Erreur chargement caméras:', error);
      // Pas besoin de toast ici car requestCameraPermission gère déjà les erreurs
    }
  };

  const startScanning = async () => {
    if (!selectedCamera) {
      toast.error('Veuillez sélectionner une caméra');
      return;
    }

    try {
      html5QrCodeRef.current = new Html5Qrcode('qr-reader');
      
      await html5QrCodeRef.current.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        handleScanSuccess,
        handleScanError
      );

      setScanning(true);
      toast.success('Scanner activé');
    } catch (error) {
      console.error('Erreur démarrage scanner:', error);
      toast.error('Impossible de démarrer le scanner');
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current && scanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
        setScanning(false);
        toast.info('Scanner arrêté');
      } catch (error) {
        console.error('Erreur arrêt scanner:', error);
      }
    }
  };

  const handleScanSuccess = async (decodedText, decodedResult) => {
    try {
      // Parser les données du QR code
      const qrData = JSON.parse(decodedText);
      
      // Vérifier que c'est bien un QR code d'employé
      if (qrData.type !== 'EMPLOYEE_ATTENDANCE') {
        toast.error('QR code invalide');
        return;
      }

      // Vérifier que l'employé existe
      const employe = employes.find(e => e.id === qrData.employeId);
      if (!employe) {
        toast.error('Employé non trouvé');
        return;
      }

      // Vérifier si l'employé a déjà pointé aujourd'hui
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const presencesQuery = query(
        collection(db, 'presences'),
        where('employeId', '==', qrData.employeId)
      );
      
      const presencesSnapshot = await getDocs(presencesQuery);
      const todayPresences = presencesSnapshot.docs.filter(doc => {
        const presenceDate = doc.data().date?.toDate();
        if (!presenceDate) return false;
        presenceDate.setHours(0, 0, 0, 0);
        return presenceDate.getTime() === today.getTime();
      });

      if (todayPresences.length > 0) {
        toast.error(`${employe.nom} a déjà pointé aujourd'hui`, {
          icon: '⚠️',
          duration: 4000
        });
        return;
      }

      // Enregistrer la présence
      const now = new Date();
      const heureActuelle = now.toTimeString().slice(0, 5); // Format HH:MM

      const presenceData = {
        employeId: qrData.employeId,
        date: today,
        statut: 'present',
        heureArrivee: heureActuelle,
        heureDepart: '',
        commentaire: 'Pointage QR Code',
        createdAt: now
      };

      await addDoc(collection(db, 'presences'), presenceData);

      // Mettre à jour l'historique
      const scanRecord = {
        employe: employe,
        heure: heureActuelle,
        timestamp: now
      };
      
      setLastScan(scanRecord);
      setScanHistory(prev => [scanRecord, ...prev.slice(0, 9)]); // Garder les 10 derniers

      toast.success(
        <div>
          <strong>✅ Pointage réussi!</strong>
          <br />
          {employe.nom} - {heureActuelle}
        </div>,
        { duration: 3000 }
      );

      if (onSuccess) {
        onSuccess();
      }

      // Vibration si disponible
      if ('vibrate' in navigator) {
        navigator.vibrate(200);
      }

    } catch (error) {
      console.error('Erreur traitement QR:', error);
      toast.error('Erreur lors du pointage');
    }
  };

  const handleScanError = (errorMessage) => {
    // Ignorer les erreurs de scan normales (pas de QR code détecté)
    // console.log('Scan error:', errorMessage);
  };

  // Instructions pour résoudre les problèmes de permission
  const renderPermissionHelp = () => {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isChrome = /chrome/i.test(navigator.userAgent) && !/edge/i.test(navigator.userAgent);
    const isFirefox = /firefox/i.test(navigator.userAgent);

    return (
      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6 m-6">
        <div className="flex items-start space-x-4">
          <AlertCircle className="text-yellow-600 flex-shrink-0 mt-1" size={32} />
          <div className="flex-1">
            <h4 className="text-lg font-bold text-yellow-800 mb-3">
              🔒 Permission de caméra requise
            </h4>
            <p className="text-yellow-700 mb-4">
              Votre navigateur doit avoir la permission d'accéder à la caméra pour scanner les QR codes.
            </p>
            
            <div className="bg-white rounded-lg p-4 mb-4">
              <h5 className="font-semibold text-gray-800 mb-2">
                {isChrome && '🌐 Google Chrome / Edge'}
                {isFirefox && '🦊 Firefox'}
                {isSafari && '🧭 Safari'}
                {!isChrome && !isFirefox && !isSafari && '🌐 Votre navigateur'}
              </h5>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                {isChrome && (
                  <>
                    <li>Cliquez sur l'icône 🔒 ou 🎥 dans la barre d'adresse</li>
                    <li>Sélectionnez "Caméra" puis "Autoriser"</li>
                    <li>Rechargez la page</li>
                  </>
                )}
                {isFirefox && (
                  <>
                    <li>Cliquez sur l'icône 🔒 dans la barre d'adresse</li>
                    <li>Cliquez sur ">" à côté de "Permissions bloquées"</li>
                    <li>Activez la permission "Caméra"</li>
                    <li>Rechargez la page</li>
                  </>
                )}
                {isSafari && (
                  <>
                    <li>Allez dans Safari → Préférences → Sites Web</li>
                    <li>Sélectionnez "Caméra" dans la liste</li>
                    <li>Trouvez ce site et sélectionnez "Autoriser"</li>
                    <li>Rechargez la page</li>
                  </>
                )}
                {!isChrome && !isFirefox && !isSafari && (
                  <>
                    <li>Recherchez l'icône de caméra dans la barre d'adresse</li>
                    <li>Cliquez et sélectionnez "Autoriser"</li>
                    <li>Rechargez la page</li>
                  </>
                )}
              </ol>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setPermissionError(null);
                  requestCameraPermission();
                }}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <Camera size={20} />
                <span>Réessayer</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">
              📷 Scanner QR Code
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Scannez le QR code d'un employé pour enregistrer sa présence
            </p>
          </div>
          <button
            onClick={async () => {
              await stopScanning();
              onClose();
            }}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Afficher l'aide si erreur de permission */}
        {permissionError && renderPermissionHelp()}

        {/* Contenu principal - seulement si permission accordée */}
        {!permissionError && permissionGranted && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Zone de scan */}
              <div className="lg:col-span-2">
                {/* Sélection de caméra */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Caméra
                  </label>
                  <div className="flex space-x-2">
                    <select
                      value={selectedCamera}
                      onChange={(e) => setSelectedCamera(e.target.value)}
                      disabled={scanning}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    >
                      {cameras.map(camera => (
                        <option key={camera.id} value={camera.id}>
                          {camera.label || `Caméra ${camera.id}`}
                        </option>
                      ))}
                    </select>
                    {!scanning ? (
                      <button
                        onClick={startScanning}
                        disabled={!selectedCamera}
                        className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Video size={20} />
                        <span>Démarrer</span>
                      </button>
                    ) : (
                      <button
                        onClick={stopScanning}
                        className="flex items-center space-x-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
                      >
                        <Square size={20} />
                        <span>Arrêter</span>
                      </button>
                    )}
                  </div>
                </div>

              {/* Zone de scan vidéo */}
              <div className="relative bg-gray-900 rounded-xl overflow-hidden">
                <div id="qr-reader" className="w-full min-h-[400px]"></div>
                
                {!scanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Camera size={64} className="mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Cliquez sur "Démarrer" pour scanner</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Dernier scan */}
              {lastScan && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="text-green-600" size={24} />
                    <div className="flex-1">
                      <p className="font-semibold text-green-800">
                        Dernier pointage: {lastScan.employe.nom}
                      </p>
                      <p className="text-sm text-green-700">
                        {lastScan.employe.poste} - {lastScan.heure}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Historique */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <AlertCircle size={20} className="mr-2" />
                  Historique des scans
                </h4>
                
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {scanHistory.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">
                      Aucun scan effectué
                    </p>
                  ) : (
                    scanHistory.map((scan, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg p-3 border border-gray-200"
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="text-blue-600" size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {scan.employe.nom}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {scan.employe.poste}
                            </p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 ml-10">
                          ⏰ {scan.heure}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Statistiques */}
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-semibold text-blue-800 mb-2">
                  📊 Session actuelle
                </h5>
                <div className="space-y-1 text-sm text-blue-700">
                  <div className="flex justify-between">
                    <span>Scans réussis:</span>
                    <strong>{scanHistory.length}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Employés actifs:</span>
                    <strong>{employes.filter(e => e.statut === 'actif').length}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h5 className="font-semibold text-yellow-800 mb-2">💡 Instructions</h5>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Positionnez le QR code devant la caméra</li>
              <li>• Le pointage se fait automatiquement dès la détection</li>
              <li>• Un employé ne peut pointer qu'une seule fois par jour</li>
              <li>• L'heure de pointage est enregistrée automatiquement</li>
            </ul>
          </div>
        </div>
        )}

        {/* Message de chargement */}
        {!permissionError && !permissionGranted && (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Demande d'accès à la caméra en cours...</p>
            <p className="text-sm text-gray-500 mt-2">Veuillez autoriser l'accès dans votre navigateur</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;

