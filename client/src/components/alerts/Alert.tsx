import { useState } from 'react';

interface ModalInterface {
  message: string;
  onClose: () => void;
}
const ModalAlert = ({ message, onClose }: ModalInterface) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 m-2">
      <div className="fixed inset-0 bg-white dark:bg-black"></div>
      <div
        className={`bg-transparent relative p-6 rounded-lg shadow-lg max-w-sm w-full`}
      >
        <p className="text-black dark:text-white">{message}</p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ModalAlert;
