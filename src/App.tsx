import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { Login } from './components/auth/Login';
import { Portal } from './components/apps/Portal';
import { POS } from './components/apps/POS';
import { BackOffice } from './components/apps/BackOffice';
import { PromotionsBuilder } from './components/apps/promotions/PromotionsBuilder';
import { KDS } from './components/apps/KDS';
import { Products } from './components/apps/Products';
import { Inventory } from './components/apps/Inventory';
import { Purchasing } from './components/apps/Purchasing';
import { Customers } from './components/apps/Customers';
import { Reports } from './components/apps/Reports';
import { Calendar } from './components/apps/Calendar';
import { Accounting } from './components/apps/Accounting';
import { Imports } from './components/apps/Imports';
import { Devices } from './components/apps/Devices';
import { UXDemo } from './components/ui/UXDemo';
import { CreateProduct } from './components/apps/CreateProduct';
import { CreateTransfer } from './components/apps/CreateTransfer';
import { Support } from './components/apps/Support';
import { Payment } from './components/apps/Payment';
import { useAuthStore } from './stores/authStore';
import { useOfflineStore } from './stores/offlineStore';

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
          <Route path="purchasing" element={<Purchasing />} />
          <Route path="customers" element={<Customers />} />
          <Route path="promotions" element={<PromotionsBuilder />} />
          <Route path="reports" element={<Reports />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="accounting" element={<Accounting />} />
          <Route path="imports" element={<Imports />} />
          <Route path="devices" element={<Devices />} />
          <Route path="backoffice" element={<BackOffice />} />
          <Route path="ux-demo" element={<UXDemo />} />
          <Route path="products/create" element={<CreateProduct />} />
          <Route path="inventory/transfer" element={<CreateTransfer />} />
          <Route path="support" element={<Support />} />
          <Route path="payment" element={<Payment />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
