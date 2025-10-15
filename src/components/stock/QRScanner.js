import React, { useState, useRef, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Html5QrcodeScanType } from 'html5-qrcode';
import { Camera, X, CheckCircle, AlertCircle, Package, User } from 'lucide-react';
import toast from 'react-hot-toast';

const QRScanner = ({ onClose, onItemFound, stockItems = [] }) => {
  const [scanner, setScanner] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedItem, setScannedItem] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [scanner]);

  const startScanner = () => {
    if (scanner) {
      scanner.clear();
    }

    const newScanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
      },
      false
    );

    newScanner.render(
      (decodedText, decodedResult) => {
        handleScan(decodedText);
      },
      (errorMessage) => {
        // Erreur de scan silencieuse (trop fréquente)
        console.debug('Erreur de scan:', errorMessage);
      }
    );

    setScanner(newScanner);
    setIsScanning(true);
  };

  const stopScanner = () => {
    if (scanner) {
      scanner.clear();
      setScanner(null);
    }
    setIsScanning(false);
  };

  const handleScan = (decodedText) => {
    try {
      const data = JSON.parse(decodedText);
      
      if (data.type === 'stock_item' && data.id) {
        // Rechercher l'article dans la liste
        const foundItem = stockItems.find(item => item.id === data.id);
        
        if (foundItem) {
          setScannedItem(foundItem);
          setScanResult({
            success: true,
            message: 'Article trouvé avec succès !',
            item: foundItem
          });
          
          // Arrêter le scanner
          stopScanner();
          
          toast.success(`Article scanné: ${foundItem.nom}`);
          
          // Notifier le composant parent
          if (onItemFound) {
            onItemFound(foundItem);
          }
        } else {
          setScanResult({
            success: false,
            message: 'Article non trouvé dans la base de données',
            data: data
          });
          toast.error('Article non trouvé dans la base de données');
        }
      } else {
        setScanResult({
          success: false,
          message: 'QR Code non reconnu - Format invalide',
          data: data
        });
        toast.error('QR Code non reconnu');
      }
    } catch (error) {
      setScanResult({
        success: false,
        message: 'QR Code non valide - Impossible de lire les données',
        rawText: decodedText
      });
      toast.error('QR Code non valide');
    }
  };

  const resetScanner = () => {
    setScannedItem(null);
    setScanResult(null);
    if (!isScanning) {
      startScanner();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Scanner QR Code - Stock
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Zone de scan */}
          <div className="mb-6">
            <div className="bg-gray-100 rounded-lg p-4">
              <div id="qr-reader" className="w-full"></div>
              
              {!isScanning && !scanResult && (
                <div className="text-center py-8">
                  <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Scanner prêt à l'emploi</p>
                  <button
                    onClick={startScanner}
                    className="flex items-center space-x-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors mx-auto"
                  >
                    <Camera className="h-5 w-5" />
                    <span>Démarrer le scan</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Résultat du scan */}
          {scanResult && (
            <div className={`p-4 rounded-lg mb-6 ${
              scanResult.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start space-x-3">
                {scanResult.success ? (
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-red-600 mt-1" />
                )}
                <div className="flex-1">
                  <h4 className={`font-semibold ${
                    scanResult.success ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {scanResult.message}
                  </h4>
                  
                  {scanResult.success && scanResult.item && (
                    <div className="mt-3">
                      <div className="bg-white p-3 rounded border">
                        <div className="flex items-center space-x-3">
                          <Package className="h-8 w-8 text-teal-600" />
                          <div>
                            <h5 className="font-semibold text-gray-900">
                              {scanResult.item.nom}
                            </h5>
                            <p className="text-sm text-gray-600">
                              Référence: {scanResult.item.reference || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-600">
                              Quantité: {scanResult.item.quantite || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {!scanResult.success && (
                    <div className="mt-3">
                      <details className="text-sm">
                        <summary className="cursor-pointer text-gray-700">
                          Détails techniques
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                          {JSON.stringify(scanResult.data || scanResult.rawText, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <p>• Positionnez le QR Code dans le cadre</p>
              <p>• Assurez-vous d'avoir un bon éclairage</p>
              <p>• Maintenez une distance stable</p>
            </div>
            
            <div className="flex space-x-3">
              {isScanning && (
                <button
                  onClick={stopScanner}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Arrêter
                </button>
              )}
              
              {scanResult && (
                <button
                  onClick={resetScanner}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Scanner à nouveau
                </button>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h5 className="font-semibold text-blue-900 mb-2">📱 Comment utiliser le scanner</h5>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Cliquez sur "Démarrer le scan"</li>
              <li>2. Autorisez l'accès à la caméra si demandé</li>
              <li>3. Pointez la caméra vers le QR Code de l'article</li>
              <li>4. Le scan se fait automatiquement</li>
              <li>5. Les informations de l'article s'affichent</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
