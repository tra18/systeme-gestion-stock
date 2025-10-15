import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer, X, Link as LinkIcon, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

const UniversalQRGenerator = ({ onClose }) => {
  const [qrSize, setQrSize] = useState(512);
  const [copied, setCopied] = useState(false);

  // URL de pointage (à adapter selon votre domaine)
  // Pour test mobile, utilisez l'IP de votre ordinateur au lieu de localhost
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const pointageUrl = isLocalhost 
    ? `http://192.168.178.182:3000/pointage-mobile`  // IP de votre Mac
    : `${window.location.origin}/pointage-mobile`;
  
  // Debug : afficher l'URL générée
  console.log('🔍 QR Universel - URL générée:', pointageUrl);
  console.log('🔍 QR Universel - Origin:', window.location.origin);

  const handleDownloadQR = () => {
    const svg = document.getElementById('universal-qr-code');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = qrSize;
      canvas.height = qrSize;
      ctx.drawImage(img, 0, 0);
      
      const link = document.createElement('a');
      link.download = `QR_Pointage_Universel.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('QR code téléchargé !');
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrintQR = () => {
    const printWindow = window.open('', '_blank');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code Pointage Universel</title>
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 40px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              font-family: Arial, sans-serif;
              min-height: 100vh;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            h1 {
              color: #2563eb;
              font-size: 36px;
              margin: 0 0 10px 0;
            }
            .subtitle {
              color: #666;
              font-size: 18px;
              margin: 0;
            }
            .qr-container {
              text-align: center;
              padding: 40px;
              border: 4px solid #2563eb;
              border-radius: 20px;
              background: white;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .qr-code {
              margin: 20px 0;
            }
            .instructions {
              margin-top: 30px;
              padding: 20px;
              background: #f0f9ff;
              border-radius: 10px;
              border-left: 4px solid #2563eb;
            }
            .instructions h3 {
              color: #1e40af;
              margin-top: 0;
            }
            .instructions ol {
              text-align: left;
              color: #374151;
              line-height: 1.8;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              color: #999;
              font-size: 12px;
            }
            .security-note {
              margin-top: 20px;
              padding: 15px;
              background: #fef3c7;
              border-radius: 8px;
              border-left: 4px solid #f59e0b;
              text-align: left;
            }
            .security-note strong {
              color: #92400e;
            }
            @media print {
              body {
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🚀 Pointage Mobile</h1>
            <p class="subtitle">Scannez ce QR code avec votre téléphone personnel</p>
          </div>
          
          <div class="qr-container">
            <div class="qr-code">
              ${document.getElementById('universal-qr-code').outerHTML}
            </div>
            <p style="font-size: 16px; color: #666; margin: 10px 0 0 0;">
              QR Code Universel - Tous les employés
            </p>
          </div>

          <div class="instructions">
            <h3>📱 Instructions d'utilisation</h3>
            <ol>
              <li><strong>Scannez le QR code</strong> avec l'appareil photo de votre téléphone</li>
              <li><strong>Ouvrez le lien</strong> dans votre navigateur</li>
              <li><strong>Entrez votre code PIN personnel</strong> (fourni par le service RH)</li>
              <li><strong>Pointage automatique</strong> chaque matin en scannant le code</li>
            </ol>
          </div>

          <div class="security-note">
            <strong>🔒 Sécurité:</strong> Votre téléphone sera automatiquement associé à votre compte employé lors du premier scan. 
            Seul votre appareil pourra pointer pour vous, empêchant toute fraude.
          </div>

          <div class="footer">
            <p>Système de Gestion RH - ${new Date().getFullYear()}</p>
            <p>URL: ${pointageUrl}</p>
          </div>

          <script>
            window.onload = function() {
              setTimeout(() => window.print(), 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(pointageUrl);
    setCopied(true);
    toast.success('Lien copié !');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            🔲 QR Code Universel de Pointage
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Description */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-blue-800 mb-2">
            ✨ Nouveau système sécurisé
          </h4>
          <p className="text-sm text-blue-700">
            Un seul QR code pour tous les employés ! Chaque employé scanne avec son téléphone personnel, 
            qui sera automatiquement associé à son compte pour éviter toute fraude.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* QR Code */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="bg-white p-6 rounded-xl shadow-lg mx-auto inline-block">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600 font-mono">
                    URL encodée: {pointageUrl}
                  </p>
                </div>
                <QRCodeSVG
                  id="universal-qr-code"
                  value={pointageUrl}
                  size={qrSize}
                  level="H"
                  includeMargin={true}
                />
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                  Taille: {qrSize}px
                </label>
                <input
                  type="range"
                  min="256"
                  max="768"
                  step="64"
                  value={qrSize}
                  onChange={(e) => setQrSize(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleDownloadQR}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-lg"
              >
                <Download size={20} />
                <span>Télécharger le QR Code</span>
              </button>
              
              <button
                onClick={handlePrintQR}
                className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition shadow-lg"
              >
                <Printer size={20} />
                <span>Imprimer (Affiche A4)</span>
              </button>

              <button
                onClick={handleCopyUrl}
                className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
              >
                {copied ? <Copy size={20} /> : <LinkIcon size={20} />}
                <span>{copied ? 'Copié !' : 'Copier le lien'}</span>
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
              <h4 className="font-semibold text-gray-800 mb-3">
                📋 Mode d'emploi
              </h4>
              <ol className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <span>
                    <strong>Imprimez ou affichez</strong> ce QR code dans un lieu visible (entrée, salle de pause, etc.)
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <span>
                    Chaque employé <strong>scanne le QR code</strong> avec son téléphone personnel
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  <span>
                    Au <strong>premier scan</strong>, l'employé entre son <strong>code PIN personnel</strong>
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    4
                  </span>
                  <span>
                    Le téléphone est <strong>associé au compte</strong> de l'employé
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    5
                  </span>
                  <span>
                    Les jours suivants, le <strong>pointage est automatique</strong> dès le scan !
                  </span>
                </li>
              </ol>
            </div>

            {/* Sécurité */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                🔒 Sécurité anti-fraude
              </h4>
              <ul className="space-y-2 text-sm text-green-700">
                <li>✅ Un appareil = Un employé</li>
                <li>✅ Identification unique par téléphone</li>
                <li>✅ Impossible de pointer pour quelqu'un d'autre</li>
                <li>✅ Historique des appareils enregistrés</li>
                <li>✅ Possibilité de changer d'appareil (avec validation)</li>
              </ul>
            </div>

            {/* Code PIN */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">
                🔑 Codes PIN employés
              </h4>
              <p className="text-sm text-yellow-700 mb-2">
                Chaque employé doit avoir un code PIN personnel (4-6 chiffres). 
                Vous pouvez :
              </p>
              <ul className="space-y-1 text-sm text-yellow-700">
                <li>• Les générer automatiquement</li>
                <li>• Les attribuer manuellement dans l'onglet Employés</li>
                <li>• Les communiquer de façon sécurisée</li>
              </ul>
            </div>

            {/* URL */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Lien de pointage
              </h4>
              <code className="text-xs text-gray-700 break-all block bg-white p-2 rounded border">
                {pointageUrl}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversalQRGenerator;

