import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { queuePdfSalesReport, pollPdfSalesReport, SalesReportParams } from '../api/sales_dashboard_manager';

export type PdfJobStatus = 'idle' | 'queue' | 'active' | 'completed' | 'failed';

export interface PdfJobState {
  status: PdfJobStatus;
  jobId: string | null;
  error: string | null;
  blob: Blob | null;
  params: SalesReportParams | null;
  fileName: string;
}

interface PdfReportContextProps {
  job: PdfJobState;
  startPdfGeneration: (params: SalesReportParams) => Promise<void>;
  clearJob: () => void;
  downloadPdf: () => void;
}

const PdfReportContext = createContext<PdfReportContextProps | undefined>(undefined);

export const PdfReportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [job, setJob] = useState<PdfJobState>({
    status: 'idle',
    jobId: null,
    error: null,
    blob: null,
    params: null,
    fileName: 'sales_report.pdf',
  });

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef<boolean>(false);

  const clearJob = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    isPollingRef.current = false;
    setJob({
      status: 'idle',
      jobId: null,
      error: null,
      blob: null,
      params: null,
      fileName: 'sales_report.pdf',
    });
  };

  const startPdfGeneration = async (params: SalesReportParams) => {
    // Clear any existing job
    clearJob();

    let readableName = 'sales_report';
    if (params.reportType && params.reportType !== 'all') {
      readableName += `_${params.reportType}`;
      if (params.id) {
        readableName += `_${params.id}`;
      }
    } else {
      readableName += '_all';
    }
    if (params.period) {
      readableName += `_${params.period}`;
    }
    const cleanFileName = `${readableName}_${new Date().toISOString().split('T')[0]}_${Date.now()}.pdf`;

    setJob({
      status: 'queue',
      jobId: null,
      error: null,
      blob: null,
      params,
      fileName: cleanFileName,
    });

    try {
      const response = await queuePdfSalesReport(params);
      
      const jobId = response.jobId || response.data?.jobId || null;
      const rawStatus = response.status || response.data?.status || 'queue';
      const status = rawStatus === 'queued' ? 'queue' : rawStatus;

      setJob((prev) => ({
        ...prev,
        jobId,
        status: status as PdfJobStatus,
      }));
    } catch (error: any) {
      console.error('Error starting PDF report generation:', error);
      const errMsg = error.response?.data?.message || error.message || 'Failed to queue report';
      setJob((prev) => ({
        ...prev,
        status: 'failed',
        error: errMsg,
      }));
    }
  };

  const downloadPdf = () => {
    if (job.blob) {
      const url = window.URL.createObjectURL(job.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = job.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  };

  useEffect(() => {
    const isGenerating = job.status === 'queue' || job.status === 'active';

    if (!isGenerating || !job.jobId) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      isPollingRef.current = false;
      return;
    }

    if (isPollingRef.current) {
      return;
    }

    isPollingRef.current = true;

    const runPoll = async () => {
      try {
        const res = await pollPdfSalesReport(job.jobId!);

        if (res instanceof Blob) {
          // Success! The server returned the PDF report binary
          setJob((prev) => ({
            ...prev,
            status: 'completed',
            blob: res,
          }));
          isPollingRef.current = false;
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        } else if (res && (res.status === 'queued' || res.status === 'queue' || res.status === 'active' || res.status === 'processing')) {
          // Keep polling and update status
          const normalizedStatus = (res.status === 'queued' || res.status === 'queue') ? 'queue' : 'active';
          setJob((prev) => ({
            ...prev,
            status: normalizedStatus as PdfJobStatus,
          }));
        } else if (res && res.status === 'completed') {
          // Completed, but returned as an object with downloadUrl or similar
          if (res.downloadUrl) {
            const response = await fetch(res.downloadUrl);
            const blob = await response.blob();
            setJob((prev) => ({
              ...prev,
              status: 'completed',
              blob,
            }));
          } else {
            setJob((prev) => ({
              ...prev,
              status: 'failed',
              error: 'Completed status received but no download link was found',
            }));
          }
          isPollingRef.current = false;
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        } else if (res && res.status === 'failed') {
          // Server reported job failure
          setJob((prev) => ({
            ...prev,
            status: 'failed',
            error: res.error || 'Server failed to generate the PDF report',
          }));
          isPollingRef.current = false;
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        } else {
          // Fallback: If it's something unexpected but not obviously a failure, continue polling
          console.warn('Unexpected polling response:', res);
        }
      } catch (error: any) {
        console.error('Error polling PDF report:', error);
        // We don't fail immediately on temporary network errors.
        // But if it's a 4xx / 5xx terminal error, we should stop and show error
        const statusCode = error.response?.status;
        if (statusCode && statusCode >= 400 && statusCode !== 404) {
          setJob((prev) => ({
            ...prev,
            status: 'failed',
            error: error.response?.data?.message || error.message || 'Error occurred during status polling',
          }));
          isPollingRef.current = false;
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        }
      }
    };

    // Poll every 5 seconds
    pollIntervalRef.current = setInterval(runPoll, 5000);
    
    // Run immediately first time
    runPoll();

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      isPollingRef.current = false;
    };
  }, [job.status, job.jobId]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  return (
    <PdfReportContext.Provider value={{ job, startPdfGeneration, clearJob, downloadPdf }}>
      {children}
    </PdfReportContext.Provider>
  );
};

export const usePdfReport = () => {
  const context = useContext(PdfReportContext);
  if (!context) {
    throw new Error('usePdfReport must be used within a PdfReportProvider');
  }
  return context;
};
