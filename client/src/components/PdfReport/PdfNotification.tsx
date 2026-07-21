import React from 'react';
import { usePdfReport } from '../../context/PdfReportContext';
import { Loader2, X, Download, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

const PdfNotification: React.FC = () => {
  const { job, clearJob, downloadPdf } = usePdfReport();

  if (job.status === 'idle') {
    return null;
  }

  const renderStatusContent = () => {
    switch (job.status) {
      case 'queue':
        return (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                <Loader2 className="w-3 h-3 animate-spin" />
                Queued
              </span>
              <button 
                onClick={clearJob}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Adding report to queue...
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Your request is waiting to be processed by the server.
            </p>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full w-1/3 animate-pulse" />
            </div>
          </div>
        );
      
      case 'active':
        return (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
                <Loader2 className="w-3 h-3 animate-spin" />
                Generating
              </span>
              <button 
                onClick={clearJob}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Compiling report...
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Gathering data and generating PDF. You can continue working in other tabs.
            </p>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full w-2/3 animate-infinite-loading" style={{
                animation: 'infinite-loading 2s infinite linear'
              }} />
            </div>
          </div>
        );

      case 'completed':
        return (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                <CheckCircle2 className="w-3 h-3" />
                Ready
              </span>
              <button 
                onClick={clearJob}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-500" />
                Report Complete
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-1">
                {job.fileName}
              </p>
            </div>
            
            <div className="flex gap-2 mt-1">
              <button
                onClick={downloadPdf}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </button>
              <button
                onClick={clearJob}
                className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        );

      case 'failed':
        return (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50">
                <AlertTriangle className="w-3 h-3" />
                Failed
              </span>
              <button 
                onClick={clearJob}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-850 dark:text-slate-250">
                Failed to generate PDF
              </p>
              <p className="text-xs text-rose-500 dark:text-rose-400 mt-1 max-h-12 overflow-y-auto">
                {job.error || 'Unknown error occurred.'}
              </p>
            </div>
            
            <button
              onClick={clearJob}
              className="w-full inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Dismiss
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      className="fixed bottom-5 right-5 z-[99999] max-w-sm w-[340px] bg-white dark:bg-boxdark border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-4 transition-all duration-300 ease-out animate-fade-in-up"
      style={{
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
      }}
    >
      {renderStatusContent()}
    </div>
  );
};

export default PdfNotification;
