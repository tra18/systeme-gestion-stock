import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

const SignaturePad = ({ onSave, onCancel, initialSignature = null, autoSave = false }) => {
  const sigPad = useRef(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const handleBegin = () => {
    setIsEmpty(false);
  };

  const handleEnd = () => {
    // Si autoSave est activé, sauvegarder automatiquement
    if (autoSave && sigPad.current && !sigPad.current.isEmpty()) {
      const signatureData = sigPad.current.toDataURL();
      onSave(signatureData);
    }
  };

  const handleClear = () => {
    if (sigPad.current) {
      sigPad.current.clear();
      setIsEmpty(true);
      if (autoSave) {
        onSave(''); // Effacer la signature
      }
    }
  };

  const handleSave = () => {
    if (!sigPad.current || sigPad.current.isEmpty()) {
      alert('Veuillez signer avant de sauvegarder');
      return;
    }
    
    const signatureData = sigPad.current.toDataURL();
    onSave(signatureData);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="signature-pad-container">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center space-x-2">
          <span>✍️ Signature Digitale</span>
          {autoSave && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Auto-sauvegarde</span>}
        </h3>
        <p className="text-sm text-gray-600">
          {autoSave 
            ? '✓ Signez avec votre souris ou doigt. La signature est automatiquement enregistrée.' 
            : 'Veuillez signer dans la zone ci-dessous puis cliquer sur "Sauvegarder la signature"'
          }
        </p>
      </div>
      
      <div className="border-2 border-gray-300 rounded-lg p-2 sm:p-4 bg-white flex justify-center items-center">
        <SignatureCanvas
          ref={sigPad}
          canvasProps={{
            className: 'signature-canvas',
            width: Math.min(500, window.innerWidth - 100),
            height: 150,
            style: { border: '1px solid #e5e7eb', borderRadius: '8px', display: 'block', margin: '0 auto' }
          }}
          onBegin={handleBegin}
          onEnd={handleEnd}
        />
      </div>
      
      <div className="mt-4">
        {!autoSave ? (
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <button
                onClick={handleClear}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Effacer
              </button>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={isEmpty}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                💾 Sauvegarder la signature
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <button
              onClick={handleClear}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-300 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              🗑️ Effacer et recommencer
            </button>
            <button
              onClick={handleSave}
              disabled={isEmpty}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✓ Valider la signature
            </button>
          </div>
        )}
      </div>
      
      {initialSignature && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Signature actuelle :</h4>
          <img 
            src={initialSignature} 
            alt="Signature actuelle" 
            className="border border-gray-300 rounded"
            style={{ maxWidth: '200px', maxHeight: '100px' }}
          />
        </div>
      )}
    </div>
  );
};

export default SignaturePad;
