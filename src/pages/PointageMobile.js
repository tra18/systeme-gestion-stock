import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Smartphone, CheckCircle, XCircle, AlertCircle, Clock, User, Shield } from 'lucide-react';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import toast, { Toaster } from 'react-hot-toast';
import { generateDeviceFingerprint, getDeviceInfo } from '../utils/deviceFingerprint';
import SignaturePad from '../components/rh/SignaturePad';

const PointageMobile = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [deviceFingerprint, setDeviceFingerprint] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [employeData, setEmployeData] = useState(null);
  const [deviceRegistered, setDeviceRegistered] = useState(false);
  const [pointageStatus, setPointageStatus] = useState(null);
  const [showPinInput, setShowPinInput] = useState(false);
  const [pin, setPin] = useState('');
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [pendingPointageData, setPendingPointageData] = useState(null);

  useEffect(() => {
    initializePointage();
  }, []);

  const initializePointage = async () => {
    setLoading(true);
    
    try {
      console.log('🚀 Début initialisation pointage mobile...');
      
      // 1. Générer le fingerprint de l'appareil
      console.log('📱 Génération du fingerprint...');
      const fingerprint = await generateDeviceFingerprint();
      console.log('✅ Fingerprint généré:', fingerprint);
      
      const info = getDeviceInfo();
      console.log('✅ Device info:', info);
      
      setDeviceFingerprint(fingerprint);
      setDeviceInfo(info);

      // 2. Vérifier si cet appareil est déjà enregistré
      const devicesQuery = query(
        collection(db, 'devices'),
        where('fingerprint', '==', fingerprint)
      );
      
      const devicesSnapshot = await getDocs(devicesQuery);
      
      if (!devicesSnapshot.empty) {
        // Appareil déjà enregistré
        const deviceDoc = devicesSnapshot.docs[0];
        const deviceData = deviceDoc.data();
        
        setDeviceRegistered(true);
        
        // Charger les infos de l'employé
        await loadEmployeData(deviceData.employeId);
        
        // Tenter le pointage automatique
        await attemptPointage(deviceData.employeId, fingerprint);
      } else {
        // Appareil non enregistré - demander le code PIN
        console.log('📝 Appareil non enregistré, affichage du formulaire PIN');
        setShowPinInput(true);
      }
      
      console.log('✅ Initialisation terminée avec succès');
    } catch (error) {
      console.error('❌ Erreur initialisation:', error);
      console.error('❌ Stack:', error.stack);
      console.error('❌ Message:', error.message);
      toast.error(`Erreur: ${error.message}`);
      setPointageStatus({
        type: 'error',
        message: `Erreur d'initialisation: ${error.message}. Veuillez réessayer.`
      });
    } finally {
      console.log('🏁 Fin de l\'initialisation, setLoading(false)');
      setLoading(false);
    }
  };

  const loadEmployeData = async (employeId) => {
    try {
      const employesQuery = query(
        collection(db, 'employes'),
        where('__name__', '==', employeId)
      );
      
      const employesSnapshot = await getDocs(employesQuery);
      
      if (!employesSnapshot.empty) {
        const employeDoc = employesSnapshot.docs[0];
        setEmployeData({ id: employeDoc.id, ...employeDoc.data() });
      }
    } catch (error) {
      console.error('Erreur chargement employé:', error);
    }
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    
    if (pin.length < 4) {
      toast.error('Le code PIN doit contenir au moins 4 chiffres');
      return;
    }

    setLoading(true);

    try {
      // Chercher l'employé avec ce code PIN (essayer les différentes variantes de champ)
      console.log('🔍 Recherche employé avec PIN:', pin);
      
      // Récupérer tous les employés actifs
      const employesQuery = query(
        collection(db, 'employes'),
        where('statut', '==', 'actif')
      );
      
      const employesSnapshot = await getDocs(employesQuery);
      console.log('👥 Employés actifs trouvés:', employesSnapshot.size);
      
      // Chercher celui qui a le bon PIN (codePin OU codePIN OU code_pin)
      let employeDoc = null;
      for (const doc of employesSnapshot.docs) {
        const data = doc.data();
        console.log('🔍 Employé:', data.nom, 'PIN:', data.codePin || data.codePIN || data.code_pin);
        if (data.codePin === pin || data.codePIN === pin || data.code_pin === pin) {
          employeDoc = doc;
          console.log('✅ Employé trouvé:', data.nom);
          break;
        }
      }
      
      if (!employeDoc) {
        console.error('❌ Aucun employé trouvé avec ce PIN');
        toast.error('Code PIN invalide ou employé inactif');
        setLoading(false);
        return;
      }

      const employe = { id: employeDoc.id, ...employeDoc.data() };
      console.log('✅ Données employé:', employe);
      
      // Vérifier si cet employé a déjà un appareil enregistré
      const existingDevicesQuery = query(
        collection(db, 'devices'),
        where('employeId', '==', employe.id)
      );
      
      const existingDevicesSnapshot = await getDocs(existingDevicesQuery);
      
      if (!existingDevicesSnapshot.empty) {
        // L'employé a déjà un appareil - demander confirmation pour remplacer
        const confirmReplace = window.confirm(
          `Un appareil est déjà enregistré pour ${employe.nom}. Voulez-vous remplacer l'ancien appareil par celui-ci ?`
        );
        
        if (!confirmReplace) {
          setLoading(false);
          return;
        }

        // Supprimer l'ancien appareil
        for (const deviceDoc of existingDevicesSnapshot.docs) {
          await updateDoc(doc(db, 'devices', deviceDoc.id), {
            active: false,
            replacedAt: new Date()
          });
        }
      }

      // Enregistrer le nouveau appareil
      await addDoc(collection(db, 'devices'), {
        fingerprint: deviceFingerprint,
        employeId: employe.id,
        employeNom: employe.nom,
        deviceInfo: deviceInfo,
        registeredAt: new Date(),
        active: true,
        lastUsed: new Date()
      });

      setEmployeData(employe);
      setDeviceRegistered(true);
      setShowPinInput(false);
      
      toast.success(`Appareil enregistré avec succès pour ${employe.nom}`);
      
      // Tenter le pointage
      await attemptPointage(employe.id, deviceFingerprint);
      
    } catch (error) {
      console.error('Erreur enregistrement:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const attemptPointage = async (employeId, fingerprint) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Vérifier si l'employé a déjà pointé aujourd'hui
      const presencesQuery = query(
        collection(db, 'presences'),
        where('employeId', '==', employeId)
      );
      
      const presencesSnapshot = await getDocs(presencesQuery);
      
      const todayPresence = presencesSnapshot.docs.find(doc => {
        const presenceDate = doc.data().date?.toDate();
        if (!presenceDate) return false;
        presenceDate.setHours(0, 0, 0, 0);
        return presenceDate.getTime() === today.getTime();
      });

      if (todayPresence) {
        const presence = todayPresence.data();
        
        // Vérifier si l'employé peut pointer son départ
        if (!presence.heureDepart || presence.heureDepart === '') {
          // Préparer les données de départ et demander la signature
          const now = new Date();
          const heureDepart = now.toTimeString().slice(0, 5);
          
          const departureData = {
            presenceRef: todayPresence.ref,
            heureDepart: heureDepart,
            updatedAt: now,
            isArrival: false
          };

          // Stocker les données en attente et demander la signature
          setPendingPointageData(departureData);
          setShowSignaturePad(true);
          
          return;
        } else {
          // Déjà pointé arrivée ET départ
          setPointageStatus({
            success: false,
            message: 'Pointage complet aujourd\'hui',
            time: `${presence.heureArrivee} - ${presence.heureDepart}`,
            alreadyPointed: true,
            isComplete: true
          });
          return;
        }
      }

      // Préparer les données de pointage et demander la signature
      const now = new Date();
      const heureActuelle = now.toTimeString().slice(0, 5);

      const pointageData = {
        employeId: employeId,
        date: today,
        statut: 'present',
        heureArrivee: heureActuelle,
        heureDepart: '',
        commentaire: 'Pointage mobile (QR universel)',
        deviceFingerprint: fingerprint,
        createdAt: now,
        isArrival: true
      };

      // Stocker les données en attente et demander la signature
      setPendingPointageData(pointageData);
      setShowSignaturePad(true);

    } catch (error) {
      console.error('Erreur pointage:', error);
      setPointageStatus({
        success: false,
        message: 'Erreur lors du pointage',
        alreadyPointed: false
      });
      toast.error('Erreur lors du pointage');
    }
  };

  const handleResetDevice = async () => {
    const confirm = window.confirm(
      'Êtes-vous sûr de vouloir dissocier cet appareil ? Vous devrez entrer à nouveau votre code PIN.'
    );
    
    if (!confirm) return;

    try {
      // Désactiver l'appareil
      const devicesQuery = query(
        collection(db, 'devices'),
        where('fingerprint', '==', deviceFingerprint)
      );
      const devicesSnapshot = await getDocs(devicesQuery);
      
      if (!devicesSnapshot.empty) {
        await updateDoc(doc(db, 'devices', devicesSnapshot.docs[0].id), {
          active: false,
          removedAt: new Date()
        });
      }

      toast.success('Appareil dissocié');
      
      // Réinitialiser l'état
      setDeviceRegistered(false);
      setEmployeData(null);
      setPointageStatus(null);
      setShowPinInput(true);
      setPin('');
      
    } catch (error) {
      console.error('Erreur reset:', error);
      toast.error('Erreur lors de la dissociation');
    }
  };

  // Fonctions de gestion de signature
  const handleSignatureSave = async (signatureData) => {
    try {
      setShowSignaturePad(false);
      setLoading(true);

      if (pendingPointageData.isArrival) {
        // Pointage d'arrivée
        const pointageData = {
          ...pendingPointageData,
          signature: signatureData,
          signatureTimestamp: new Date()
        };

        await addDoc(collection(db, 'presences'), pointageData);

        // Mettre à jour la dernière utilisation de l'appareil
        const devicesQuery = query(
          collection(db, 'devices'),
          where('fingerprint', '==', deviceFingerprint)
        );
        const devicesSnapshot = await getDocs(devicesQuery);
        
        if (!devicesSnapshot.empty) {
          await updateDoc(doc(db, 'devices', devicesSnapshot.docs[0].id), {
            lastUsed: new Date()
          });
        }

        setPointageStatus({
          success: true,
          message: 'Arrivée enregistrée avec succès',
          time: pendingPointageData.heureArrivee,
          alreadyPointed: false
        });

        toast.success(`✅ Arrivée enregistrée à ${pendingPointageData.heureArrivee}`);

      } else {
        // Pointage de départ
        await updateDoc(pendingPointageData.presenceRef, {
          heureDepart: pendingPointageData.heureDepart,
          signatureDepart: signatureData,
          signatureDepartTimestamp: new Date(),
          updatedAt: pendingPointageData.updatedAt
        });

        setPointageStatus({
          success: true,
          message: 'Départ enregistré avec succès',
          time: pendingPointageData.heureDepart,
          alreadyPointed: false,
          isDeparture: true
        });

        toast.success(`✅ Départ enregistré à ${pendingPointageData.heureDepart}`);
      }

      // Vibration si disponible
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }

      // Réinitialiser les données en attente
      setPendingPointageData(null);

    } catch (error) {
      console.error('Erreur lors de l\'enregistrement avec signature:', error);
      toast.error('❌ Erreur lors de l\'enregistrement');
      setPointageStatus({
        success: false,
        message: 'Erreur lors de l\'enregistrement'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignatureCancel = () => {
    setShowSignaturePad(false);
    setPendingPointageData(null);
    toast.info('Pointage annulé');
  };

  console.log('🎨 Rendu du composant, loading:', loading, 'showPinInput:', showPinInput, 'deviceRegistered:', deviceRegistered);

  if (loading) {
    console.log('⏳ Affichage de l\'écran de chargement');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Identification en cours...</p>
          <p className="text-sm text-gray-500 mt-2">Veuillez patienter</p>
        </div>
      </div>
    );
  }

  console.log('✅ Affichage du contenu principal');
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <Toaster position="top-center" />
      
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Pointage Mobile
          </h1>
          <p className="text-gray-600">
            Système sécurisé par identification d'appareil
          </p>
        </div>

        {/* Formulaire PIN (si appareil non enregistré) */}
        {showPinInput && !deviceRegistered && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Shield className="text-blue-600 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-semibold text-blue-800 mb-1">
                    Premier pointage
                  </h3>
                  <p className="text-sm text-blue-700">
                    Entrez votre code PIN personnel pour associer cet appareil à votre compte employé.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code PIN Personnel
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Entrez votre code PIN"
                  className="w-full px-4 py-3 text-center text-2xl tracking-widest border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength="6"
                  required
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Demandez votre code PIN au service RH si vous ne l'avez pas
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || pin.length < 4}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? 'Vérification...' : 'Valider'}
              </button>
            </form>

            {/* Infos appareil */}
            {deviceInfo && (
              <div className="bg-gray-50 rounded-xl p-4 mt-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Informations de l'appareil
                </h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="font-medium">
                      {deviceInfo.isMobile ? 'Mobile' : 'Desktop'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Système:</span>
                    <span className="font-medium">{deviceInfo.os}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Navigateur:</span>
                    <span className="font-medium">{deviceInfo.browser}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Statut du pointage */}
        {deviceRegistered && employeData && (
          <div className="space-y-6">
            {/* Info employé */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="text-white" size={32} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800">
                    {employeData.nom} {employeData.prenom || ''}
                  </h3>
                  <p className="text-sm text-gray-600">{employeData.poste}</p>
                  <p className="text-xs text-gray-500">{employeData.departement}</p>
                </div>
              </div>
            </div>

            {/* Résultat du pointage */}
            {pointageStatus && (
              <div className={`rounded-xl p-6 border-2 ${
                pointageStatus.success 
                  ? pointageStatus.isDeparture 
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-green-50 border-green-500' 
                  : pointageStatus.alreadyPointed
                  ? pointageStatus.isComplete
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-yellow-50 border-yellow-500'
                  : 'bg-red-50 border-red-500'
              }`}>
                <div className="flex items-center space-x-4 mb-4">
                  {pointageStatus.success ? (
                    pointageStatus.isDeparture ? (
                      <CheckCircle className="text-blue-600" size={48} />
                    ) : (
                      <CheckCircle className="text-green-600" size={48} />
                    )
                  ) : pointageStatus.alreadyPointed ? (
                    pointageStatus.isComplete ? (
                      <CheckCircle className="text-blue-600" size={48} />
                    ) : (
                      <AlertCircle className="text-yellow-600" size={48} />
                    )
                  ) : (
                    <XCircle className="text-red-600" size={48} />
                  )}
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold ${
                      pointageStatus.success 
                        ? pointageStatus.isDeparture 
                          ? 'text-blue-800'
                          : 'text-green-800' 
                        : pointageStatus.alreadyPointed
                        ? pointageStatus.isComplete
                          ? 'text-blue-800'
                          : 'text-yellow-800'
                        : 'text-red-800'
                    }`}>
                      {pointageStatus.message}
                    </h3>
                    {pointageStatus.time && (
                      <div className="flex items-center space-x-2 mt-2">
                        <Clock size={20} className="text-gray-600" />
                        <span className="text-lg font-semibold text-gray-800">
                          {pointageStatus.time}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {pointageStatus.success && !pointageStatus.isDeparture && (
                  <p className="text-sm text-green-700">
                    Votre arrivée a été enregistrée avec succès. Bonne journée ! 🎉
                  </p>
                )}

                {pointageStatus.success && pointageStatus.isDeparture && (
                  <p className="text-sm text-green-700">
                    Votre départ a été enregistré avec succès. À bientôt ! 👋
                  </p>
                )}

                {pointageStatus.alreadyPointed && !pointageStatus.isComplete && (
                  <p className="text-sm text-yellow-700">
                    Votre pointage du jour a été effectué à {pointageStatus.time}.
                  </p>
                )}

                {pointageStatus.alreadyPointed && pointageStatus.isComplete && (
                  <div className="space-y-3">
                    <p className="text-sm text-blue-700">
                      Pointage complet aujourd'hui : {pointageStatus.time}
                    </p>
                    <button
                      onClick={() => window.location.reload()}
                      className="w-full py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition text-sm font-medium"
                    >
                      Actualiser pour nouveau pointage
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Bouton reset appareil */}
            <button
              onClick={handleResetDevice}
              className="w-full py-3 border-2 border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition text-sm"
            >
              Dissocier cet appareil
            </button>

            {/* Info sécurité */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Shield className="text-gray-400 flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="text-xs text-gray-600">
                    <strong>Sécurité:</strong> Cet appareil est lié à votre compte. 
                    Seul cet appareil peut pointer pour vous.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Composant de signature */}
      {showSignaturePad && (
        <SignaturePad
          onSave={handleSignatureSave}
          onCancel={handleSignatureCancel}
          title={pendingPointageData?.isArrival ? "Signature d'arrivée" : "Signature de départ"}
        />
      )}
    </div>
  );
};

export default PointageMobile;

