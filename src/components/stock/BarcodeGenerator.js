import React, { useState, useRef } from 'react';
import { Printer, Download, QrCode, BarChart3, Eye, X } from 'lucide-react';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';

const BarcodeGenerator = ({ stockItem, onClose }) => {
  const [selectedFormat, setSelectedFormat] = useState('qr');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const canvasRef = useRef(null);

  React.useEffect(() => {
    if (stockItem) {
      generateQRCode();
    }
  }, [stockItem, selectedFormat]);

  const generateQRCode = async () => {
    try {
      const data = {
        id: stockItem.id,
        nom: stockItem.nom,
        reference: stockItem.reference,
        type: 'stock_item',
        timestamp: new Date().toISOString()
      };

      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(data), {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      setQrCodeUrl(qrCodeDataURL);
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
      toast.error('Erreur lors de la génération du QR code');
    }
  };

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.download = `QR_${stockItem.reference || stockItem.nom}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = qrCodeUrl;
      link.click();
      toast.success('QR Code téléchargé avec succès');
    }
  };

  const printQRCode = () => {
    if (qrCodeUrl) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${stockItem.nom}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 20px;
                margin: 0;
              }
              .header {
                margin-bottom: 20px;
                border-bottom: 2px solid #14B8A6;
                padding-bottom: 10px;
              }
              .logo {
                font-size: 24px;
                font-weight: bold;
                color: #14B8A6;
                margin-bottom: 5px;
              }
              .item-info {
                margin: 20px 0;
                text-align: left;
                max-width: 400px;
                margin-left: auto;
                margin-right: auto;
              }
              .info-row {
                display: flex;
                justify-content: space-between;
                margin: 5px 0;
                padding: 5px;
                background: #f5f5f5;
                border-radius: 4px;
              }
              .qr-container {
                margin: 20px 0;
                text-align: center;
              }
              .qr-code {
                border: 2px solid #14B8A6;
                border-radius: 8px;
                padding: 10px;
                background: white;
              }
              .footer {
                margin-top: 20px;
                font-size: 12px;
                color: #666;
                border-top: 1px solid #ddd;
                padding-top: 10px;
              }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">VITACH GUINÉE</div>
              <div>Code QR - Article Stock</div>
            </div>
            
            <div class="item-info">
              <div class="info-row">
                <strong>Nom:</strong>
                <span>${stockItem.nom || 'N/A'}</span>
              </div>
              <div class="info-row">
                <strong>Référence:</strong>
                <span>${stockItem.reference || 'N/A'}</span>
              </div>
              <div class="info-row">
                <strong>Catégorie:</strong>
                <span>${stockItem.categorie || 'N/A'}</span>
              </div>
              <div class="info-row">
                <strong>Quantité:</strong>
                <span>${stockItem.quantite || 0}</span>
              </div>
              <div class="info-row">
                <strong>Prix Unitaire:</strong>
                <span>${stockItem.prixUnitaire ? `${stockItem.prixUnitaire} GNF` : 'N/A'}</span>
              </div>
            </div>
            
            <div class="qr-container">
              <img src="${qrCodeUrl}" alt="QR Code" class="qr-code" />
            </div>
            
            <div class="footer">
              <p>Généré le: ${new Date().toLocaleString('fr-FR')}</p>
              <p>VITACH GUINÉE - Système de Gestion Intégré</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (!stockItem) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Génération de Code QR - {stockItem.nom}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Informations de l'article */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="font-semibold text-gray-900 mb-2">Informations de l'article</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Nom:</span>
                <p className="font-medium">{stockItem.nom || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-600">Référence:</span>
                <p className="font-medium">{stockItem.reference || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-600">Catégorie:</span>
                <p className="font-medium">{stockItem.categorie || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-600">Quantité:</span>
                <p className="font-medium">{stockItem.quantite || 0}</p>
              </div>
            </div>
          </div>

          {/* Sélection du format */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Format de code</h4>
            <div className="flex space-x-4">
              <button
                onClick={() => setSelectedFormat('qr')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  selectedFormat === 'qr'
                    ? 'bg-teal-100 border-teal-500 text-teal-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <QrCode className="h-4 w-4" />
                <span>QR Code</span>
              </button>
            </div>
          </div>

          {/* Aperçu du code QR */}
          {qrCodeUrl && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Aperçu</h4>
              <div className="flex justify-center">
                <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code" 
                    className="w-64 h-64"
                    ref={canvasRef}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span>{showPreview ? 'Masquer' : 'Aperçu'}</span>
            </button>
            
            <button
              onClick={downloadQRCode}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Télécharger</span>
            </button>
            
            <button
              onClick={printQRCode}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Printer className="h-4 w-4" />
              <span>Imprimer</span>
            </button>
          </div>

          {/* Informations sur le QR Code */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h5 className="font-semibold text-blue-900 mb-2">ℹ️ Informations sur le QR Code</h5>
            <p className="text-sm text-blue-800">
              Ce QR Code contient les informations de l'article et peut être scanné pour :
            </p>
            <ul className="text-sm text-blue-800 mt-2 ml-4 list-disc">
              <li>Accéder rapidement aux détails de l'article</li>
              <li>Effectuer des opérations de stock (entrée/sortie)</li>
              <li>Inventaire physique rapide</li>
              <li>Traçabilité des mouvements</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeGenerator;
