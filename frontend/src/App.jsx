import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import IngestionLayout from './features/layer1/IngestionLayout';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import Home from './features/home/pages/Home';
import Pricing from './features/pricing/pages/Pricing';
import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import FraudPage from './features/fraud/pages/FraudPage';
import JobMonitorPage from './features/jobs/pages/JobMonitorPage';
import SARPage from './features/sar/pages/SARPage';
import HistoryPage from './features/history/pages/HistoryPage';
import Documentation from './features/documentation/pages/Documentation';
import ApiDocs from './features/api/pages/ApiDocs';
import SitePolicy from './features/legal/pages/SitePolicy';
import Terms from './features/legal/pages/Terms';
import About from './features/company/pages/About';
import Contact from './features/company/pages/Contact';
import { useAuth } from './features/auth/hooks/useAuth';

const App = () => {
  const { fetchCurrentUser } = useAuth();

  useEffect(() => {
    fetchCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Public pages */}
        <Route path="/docs" element={<Documentation />} />
        <Route path="/api-docs" element={<ApiDocs />} />
        <Route path="/privacy-policy" element={<SitePolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* Protected: analytics dashboard overview */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Protected: file upload / ingestion */}
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <IngestionLayout />
            </ProtectedRoute>
          }
        />

        {/* Protected: fraud rings — wrapped so sidebar navigation
            redirects to /login when unauthenticated.
            Once logged in, Redux keeps fraud data alive across navigations. */}
        <Route
          path="/fraud-rings"
          element={
            <ProtectedRoute>
              <FraudPage />
            </ProtectedRoute>
          }
        />

        {/* Protected: jobs monitor dashboard */}
        <Route
          path="/jobs"
          element={
            <ProtectedRoute>
              <JobMonitorPage />
            </ProtectedRoute>
          }
        />

        {/* Protected: Analysis History */}
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />

        {/* Protected: SAR PDF generator */}
        <Route
          path="/sar"
          element={
            <ProtectedRoute>
              <SARPage />
            </ProtectedRoute>
          }
        />

        {/* Alias */}
        <Route path="/home" element={<Navigate to="/dashboard" replace />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
