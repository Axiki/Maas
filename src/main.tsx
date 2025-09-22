import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './providers/ThemeProvider';
import { UXProvider } from './providers/UXProvider';
import { LoadingProvider } from './providers/LoadingProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <UXProvider>
        <LoadingProvider>
          <App />
        </LoadingProvider>
      </UXProvider>
    </ThemeProvider>
  </StrictMode>
);
