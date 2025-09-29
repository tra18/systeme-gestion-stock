import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

const SignaturePad = ({ onSave, onCancel, initialSignature = null }) => {
  const sigPad = useRef(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const handleBegin = () => {
    setIsEmpty(false);
  };

  const handleClear = () => {
    sigPad.current.clear();
    setIsEmpty(true);
  };

  const handleSave = () => {
    if (sigPad.current.isEmpty()) {
      alert('Veuillez signer avant de sauvegarder');
      return;
    }
    
    const signatureData = sigPad.current.toDataURL();
    onSave(signatureData);
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <div className="signature-pad-container">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Signature Digitale</h3>
        <p className="text-sm text-gray-600">Veuillez signer dans la zone ci-dessous</p>
      </div>
      
      <div className="border-2 border-gray-300 rounded-lg p-2 sm:p-4 bg-white">
        <SignatureCanvas
          ref={sigPad}
          canvasProps={{
            className: 'signature-canvas w-full',
            width: Math.min(500, window.innerWidth - 100),
            height: 150,
            style: { border: '1px solid #e5e7eb', borderRadius: '8px', maxWidth: '100%' }
          }}
          onBegin={handleBegin}
        />
      </div>
      
      <div className="flex justify-between items-center mt-4">
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
            Sauvegarder la signature
          </button>
        </div>
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
