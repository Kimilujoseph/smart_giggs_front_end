import React from 'react';

interface ModalProps {
  message: string;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ message, onClose }) => {
  return (
    <div className="fixed top-4 left-0 right-0 z-9999 flex justify-center">
      <div className="m-2 flex items-center justify-between w-full max-w-md bg-white dark:bg-boxdark border border-primary/[0.2] dark:border-gray-700 rounded-lg shadow-lg p-4">
        <div className="flex items-center gap-x-2">
          <img
            src="https://img.icons8.com/fluency/48/ok--v1.png"
            className="h-12 w-12"
            alt=""
          />
          <p className="text-black dark:text-white">{message}</p>
        </div>

        <button
          onClick={onClose}
          className=" px-4 py-2 text-white rounded hover:bg-warning dark:bg-strokedark"
        >
          X
        </button>
      </div>
    </div>
  );
};

export default Modal;
