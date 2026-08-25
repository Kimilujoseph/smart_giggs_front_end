import React from 'react';
import { X, CheckCircle } from 'lucide-react';

interface SuccessModalProps {
  showMessage: string;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ showMessage, onClose }) => {
  if (!showMessage) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-boxdark rounded-lg shadow-lg w-full max-w-sm mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <CheckCircle className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Success
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300">{showMessage}</p>
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
