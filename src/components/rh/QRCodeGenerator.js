import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer, X } from 'lucide-react';
import toast from 'react-hot-toast';

const QRCodeGenerator = ({ employes, onClose }) => {
  const [selectedEmploye, setSelectedEmploye] = useState('');
  const [qrSize, setQrSize] = useState(256);

  const generateQRData = (employe) => {
    // Créer un JSON avec les infos de l'employé pour le QR code
    return JSON.stringify({
      employeId: employe.id,
      nom: employe.nom,
      prenom: employe.prenom || '',
      poste: employe.poste,
      type: 'EMPLOYEE_ATTENDANCE'
    });
  };

  const handleDownloadQR = () => {
    if (!selectedEmploye) {
      toast.error('Veuillez sélectionner un employé');
      return;
    }

    const employe = employes.find(e => e.id === selectedEmploye);
    const svg = document.getElementById('qr-code-svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = qrSize;
      canvas.height = qrSize;
      ctx.drawImage(img, 0, 0);
      
      const link = document.createElement('a');
      link.download = `QR_${employe.nom.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('QR code téléchargé !');
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrintQR = () => {
    if (!selectedEmploye) {
      toast.error('Veuillez sélectionner un employé');
      return;
    }

    const employe = employes.find(e => e.id === selectedEmploye);
    const printWindow = window.open('', '_blank');
    const qrData = generateQRData(employe);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${employe.nom}</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              font-family: Arial, sans-serif;
              min-height: 100vh;
            }
            .qr-container {
              text-align: center;
              padding: 30px;
              border: 2px solid #333;
              border-radius: 10px;
            }
            h1 {
              margin: 0 0 10px 0;
              font-size: 24px;
            }
            .info {
              margin: 10px 0;
              color: #666;
            }
            .qr-code {
              margin: 20px 0;
            }
            @media print {
              body {
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h1>Badge de Pointage</h1>
            <div class="info">
              <strong>${employe.nom} ${employe.prenom || ''}</strong><br>
              ${employe.poste}<br>
              ${employe.departement || ''}
            </div>
            <div class="qr-code">
              <svg xmlns="http://www.w3.org/2000/svg" width="${qrSize}" height="${qrSize}" viewBox="0 0 ${qrSize} ${qrSize}">
                ${document.getElementById('qr-code-svg').innerHTML}
              </svg>
            </div>
            <p style="font-size: 12px; color: #999;">Scannez ce code pour pointer</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadAll = () => {
    const activeEmployes = employes.filter(e => e.statut === 'actif');
    if (activeEmployes.length === 0) {
      toast.error('Aucun employé actif');
      return;
    }

    toast.success(`Génération de ${activeEmployes.length} QR codes...`);
    
    // Pour chaque employé, générer et télécharger le QR code
    activeEmployes.forEach((employe, index) => {
      setTimeout(() => {
        setSelectedEmploye(employe.id);
        setTimeout(() => {
          handleDownloadQR();
        }, 100);
      }, index * 500);
    });
  };

  const selectedEmployeData = employes.find(e => e.id === selectedEmploye);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            🔲 Générateur de QR Codes
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Sélection de l'employé */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sélectionner un employé
          </label>
          <select
            value={selectedEmploye}
            onChange={(e) => setSelectedEmploye(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Choisir un employé --</option>
            {employes
              .filter(e => e.statut === 'actif')
              .map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.nom} {emp.prenom || ''} - {emp.poste}
                </option>
              ))}
          </select>
        </div>

        {/* Affichage du QR Code */}
        {selectedEmployeData && (
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="flex flex-col items-center">
              <div className="bg-white p-6 rounded-xl shadow-lg mb-4">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={generateQRData(selectedEmployeData)}
                  size={qrSize}
                  level="H"
                  includeMargin={true}
                />
              </div>
              
              <div className="text-center mb-4">
                <h4 className="text-lg font-bold text-gray-800">
                  {selectedEmployeData.nom} {selectedEmployeData.prenom || ''}
                </h4>
                <p className="text-sm text-gray-600">{selectedEmployeData.poste}</p>
                <p className="text-xs text-gray-500">{selectedEmployeData.departement || ''}</p>
              </div>

              {/* Contrôles */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                  Taille du QR Code: {qrSize}px
                </label>
                <input
                  type="range"
                  min="128"
                  max="512"
                  step="32"
                  value={qrSize}
                  onChange={(e) => setQrSize(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Boutons d'action */}
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={handleDownloadQR}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  <Download size={20} />
                  <span>Télécharger</span>
                </button>
                <button
                  onClick={handlePrintQR}
                  className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  <Printer size={20} />
                  <span>Imprimer</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Actions globales */}
        <div className="border-t pt-4">
          <button
            onClick={handleDownloadAll}
            className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
          >
            <Download size={20} />
            <span>Télécharger tous les QR codes ({employes.filter(e => e.statut === 'actif').length})</span>
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            Cette action générera un QR code pour chaque employé actif
          </p>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="font-semibold text-blue-800 mb-2">📖 Instructions</h5>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Sélectionnez un employé pour générer son QR code unique</li>
            <li>• Téléchargez ou imprimez le QR code pour créer un badge</li>
            <li>• L'employé pourra scanner ce code pour pointer automatiquement</li>
            <li>• Un QR code par employé est requis pour le pointage</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;

