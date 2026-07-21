import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './css/style.css';
import './css/satoshi.css';
import 'jsvectormap/dist/css/jsvectormap.css';
import 'flatpickr/dist/flatpickr.min.css';
import { AppProvider } from './context/AppContext';
import { PdfReportProvider } from './context/PdfReportContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Router>
      <AppProvider>
        <PdfReportProvider>
          <App />
        </PdfReportProvider>
      </AppProvider>
    </Router>
  </React.StrictMode>,
);
