import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';

interface ErrorPageProps {
  code?: number;
  message?: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ code, message }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white dark:bg-boxdark">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-boxdark-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <ChevronLeft className="w-4 h-4" />
        Go Back
      </button>

      <div className="text-center">
        <div className="relative">
          <div className="md:text-8xl font-bold text-gray-900 dark:text-white">
            {code || 404}
          </div>
        </div>

        <h1 className="mt-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
          {message || 'Page Not Found'}
        </h1>
        {code === 500 && (
          <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
            An unexpected error occurred. Please try again later.
          </p>
        )}
        <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
          If you think this is a mistake, please{' '}
          <a
            className="underline text-primary"
            href="#"
            target="_blank"
            rel="noopener noreferrer"
          >
            contact us.
          </a>
        </p>

        <button
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-white dark:bg-boxdark-2 rounded-lg shadow-lg shadow hover:scale-110 transition-all duration-200"
          onClick={() => {
            localStorage.clear();
            navigate('/auth/signin');
          }}
        >
          Log Out
        </button>

        {code === 401 ||
          code === 403 ||
          (code === 404 && (
            <button
              onClick={() => navigate('/')}
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Home className="w-5 h-5" />
              Return Home
            </button>
          ))}
      </div>
    </div>
  );
};

export default ErrorPage;
