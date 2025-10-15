import React from 'react';

// Test simple du QR Code avec gestion d'erreur
const TestQRCode = () => {
  let QRComponent = null;
  let error = null;

  try {
    // Essayer d'importer QRCodeSVG (version 4.x)
    const { QRCodeSVG } = require('qrcode.react');
    QRComponent = QRCodeSVG;
  } catch (e) {
    error = `Erreur import QRCodeSVG: ${e.message}`;
    console.error(error);
  }

  if (!QRComponent) {
    try {
      // Essayer d'importer QRCode (version 3.x)
      const QRCode = require('qrcode.react').default;
      QRComponent = QRCode;
    } catch (e) {
      error = `Erreur import QRCode: ${e.message}`;
      console.error(error);
    }
  }

  const testUrl = window.location.origin + '/pointage-mobile';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">
          🧪 Test QR Code
        </h3>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 font-semibold">❌ Erreur de chargement</p>
            <p className="text-red-700 text-sm mt-2">{error}</p>
            <p className="text-red-600 text-xs mt-2">
              Vérifiez que qrcode.react est bien installé: npm install qrcode.react
            </p>
          </div>
        ) : null}

        {QRComponent ? (
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <p className="text-sm text-gray-600 mb-4">URL: {testUrl}</p>
            <div className="bg-white p-4 inline-block rounded-lg shadow">
              <QRComponent
                value={testUrl}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="text-green-600 font-semibold mt-4">✅ QR Code généré avec succès !</p>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">⚠️ Impossible de charger le composant QR Code</p>
          </div>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">📋 Diagnostic</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• Bibliothèque détectée: {QRComponent ? '✅' : '❌'}</p>
            <p>• URL: {testUrl}</p>
            <p>• Origine: {window.location.origin}</p>
          </div>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Fermer et recharger
        </button>
      </div>
    </div>
  );
};

export default TestQRCode;

