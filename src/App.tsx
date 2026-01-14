import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './features/auth/LoginPage';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { SalesPage } from './features/sales/SalesPage';
import { InventoryPage } from './features/inventory/InventoryPage';
import { ProductListPage } from './features/catalog/ProductListPage';
import { QuotesPage } from './features/sales/QuotesPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta Login (Pública) */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas Protegidas (Dentro del Layout) */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/catalog" element={<ProductListPage />} />
          <Route path="/quotes" element={<QuotesPage />} />
        </Route>

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;