import React from 'react';
import { ChevronLeft, Home } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface BreadcrumbProps {
  header?: string;
  pageName: string;
}

const Breadcrumb = ({ pageName, header }: BreadcrumbProps) => {
  const navigate = useNavigate();
  return (
    <div className="mb-4 w-full bg-white dark:bg-boxdark-2 shadow-sm rounded-lg md:p-4 p-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left section with back button and header */}
        <div className="flex justify-between md:items-center flex-1 text-primary">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back</span>
          </button>
          
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            {header || pageName}
          </h1>
        </div>

        {/* Right section with breadcrumb trail */}
        <nav className="flex items-center space-x-2 text-sm md:w-1/2 md:justify-end">
          <Link 
            to="/" 
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
          >
            <Home className="w-4 h-4 mr-1" />
            <span className="font-medium">Dashboard</span>
          </Link>
          
          <span className="text-gray-400">/</span>
          
          <span className="font-medium text-primary">
            {pageName}
          </span>
        </nav>
      </div>
    </div>
  );
};

export default Breadcrumb;