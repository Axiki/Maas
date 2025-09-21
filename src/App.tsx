import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppShell } from './components/layout/AppShell';
import { Login } from './components/auth/Login';
import { Portal } from './components/apps/Portal';
import { POS } from './components/apps/POS';
import { BackOffice } from './components/apps/BackOffice';
import { AccountingDashboard } from './components/apps/accounting/AccountingDashboard';
import { useAuthStore } from './stores/authStore';
import { useOfflineStore } from './stores/offlineStore';

// Placeholder components for other apps
const KDS = () => <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6"><h2 className="text-2xl font-bold">Kitchen Display System</h2><p className="text-muted mt-2">Coming soon...</p></motion.div>;
const Products = () => <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6"><h2 className="text-2xl font-bold">Product Catalog</h2><p className="text-muted mt-2">Coming soon...</p></motion.div>;
const Inventory = () => <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6"><h2 className="text-2xl font-bold">Inventory Management</h2><p className="text-muted mt-2">Coming soon...</p></motion.div>;
const Customers = () => <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6"><h2 className="text-2xl font-bold">Customer Management</h2><p className="text-muted mt-2">Coming soon...</p></motion.div>;
const Promotions = () => <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6"><h2 className="text-2xl font-bold">Promotions</h2><p className="text-muted mt-2">Coming soon...</p></motion.div>;
const Reports = () => <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6"><h2 className="text-2xl font-bold">Reports & Analytics</h2><p className="text-muted mt-2">Coming soon...</p></motion.div>;
const Calendar = () => <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6"><h2 className="text-2xl font-bold">Calendar & Reservations</h2><p className="text-muted mt-2">Coming soon...</p></motion.div>;
function App() {
  const { isAuthenticated } = useAuthStore();
  const { loadCachedData, setOfflineStatus } = useOfflineStore();

  useEffect(() => {
    // Load cached data on startup
    loadCachedData();

    // Setup online/offline event listeners
    const handleOnline = () => setOfflineStatus(true);
    const handleOffline = () => setOfflineStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadCachedData, setOfflineStatus]);

  if (!isAuthenticated) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Navigate to="/portal" replace />} />
          <Route path="portal" element={<Portal />} />
          <Route path="pos" element={<POS />} />
          <Route path="kds" element={<KDS />} />
          <Route path="products" element={<Products />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="customers" element={<Customers />} />
          <Route path="promotions" element={<Promotions />} />
          <Route path="reports" element={<Reports />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="accounting" element={<AccountingDashboard />} />
          <Route path="backoffice" element={<BackOffice />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
