import {
  XCircleIcon,
  CheckCircle2Icon,
  AlertCircle,
  TriangleAlert,
  X,
} from 'lucide-react';
import { useEffect } from 'react';

interface MessageProps {
  message: string;
  type: string;
  onClose: () => void;
}

const Message: React.FC<MessageProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="fixed top-4 left-0 right-0 z-9999 flex justify-center">
      <div className="m-2 flex items-center justify-between max-w-md bg-white dark:bg-boxdark border border-primary/[0.2] dark:border-gray-700 rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-center">
          <div className="mr-4">
            {type === 'warning' ? (
              <TriangleAlert className="h-12 w-12 text-warning" />
            ) : type === 'error' ? (
              <AlertCircle className="h-12 w-12 text-danger" />
            ) : (
              <CheckCircle2Icon className="h-12 w-12 text-success" />
            )}
          </div>
          <p className="text-black dark:text-white">{message}</p>
        </div>

        <button
          onClick={onClose}
          className="p-2 text-white rounded hover:bg-warning dark:bg-strokedark rounded-full"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default Message;
