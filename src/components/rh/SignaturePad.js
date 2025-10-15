import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { RotateCcw, Check, X } from 'lucide-react';

const SignaturePad = ({ onSave, onCancel, title = "Signature de pointage" }) => {
  const sigPad = useRef({});
  const [isEmpty, setIsEmpty] = useState(true);

  const handleBegin = () => {
    setIsEmpty(false);
  };

  const handleEnd = () => {
    if (!sigPad.current.isEmpty()) {
      setIsEmpty(false);
    }
  };

  const handleClear = () => {
    sigPad.current.clear();
    setIsEmpty(true);
  };

  const handleSave = () => {
    if (!sigPad.current.isEmpty()) {
      const signatureData = sigPad.current.toDataURL(); // Format base64
      onSave(signatureData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
        <h3 className="text-xl font-bold mb-4 text-center">
          ✍️ {title}
        </h3>
        
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            Veuillez signer dans la zone ci-dessous pour confirmer votre pointage
          </p>
        </div>

        <div className="border-2 border-gray-300 rounded-lg mb-4 bg-white">
          <SignatureCanvas
            ref={sigPad}
            canvasProps={{
              className: "w-full h-48 cursor-crosshair",
              style: { border: 'none' }
            }}
            backgroundColor="#ffffff"
            penColor="#000000"
            velocityFilterWeight={0.7}
            minWidth={1}
            maxWidth={3}
            onBegin={handleBegin}
            onEnd={handleEnd}
          />
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={handleClear}
            disabled={isEmpty}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <RotateCcw size={18} />
            <span>Effacer</span>
          </button>

          <button
            onClick={onCancel}
            className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
          >
            <X size={18} />
            <span>Annuler</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isEmpty}
            className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Check size={18} />
            <span>Confirmer</span>
          </button>
        </div>

        {isEmpty && (
          <p className="text-center text-sm text-gray-500 mt-2">
            Veuillez signer avant de confirmer
          </p>
        )}
      </div>
    </div>
  );
};

export default SignaturePad;
