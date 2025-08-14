import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './styles/globals.css';
import './i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './providers/AuthProvider.tsx';
import { ThemeProvider } from './providers/ThemeProvider.tsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Router>
            <AuthProvider>
              <App />
            </AuthProvider>
          </Router>
        </ThemeProvider>
        {/* The zIndex prop is not valid, Toaster is styled via CSS or its container */}
        <Toaster position="bottom-right" containerStyle={{ zIndex: 40 }} />
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
);