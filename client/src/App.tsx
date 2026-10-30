import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { ThemeProvider } from './context/ThemeContext.js';
import { ToastProvider } from './context/ToastContext.js';
import { AuthProvider } from './context/AuthContext.js';
import { CreditProvider } from './context/CreditContext.js';
import { AppLayout } from './components/layout/AppLayout.js';

import { HomePage } from './pages/HomePage.js';
import { ToolsDirectoryPage } from './pages/ToolsDirectoryPage.js';
import { CategoryPage } from './pages/CategoryPage.js';
import { ToolDetailPage } from './pages/ToolDetailPage.js';
import { PricingPage } from './pages/PricingPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { AboutPage } from './pages/AboutPage.js';
import { PrivacyPage } from './pages/PrivacyPage.js';
import { LicensesPage } from './pages/LicensesPage.js';
import { ContributingPage } from './pages/ContributingPage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';
import { ScrollToTop } from './components/common/ScrollToTop.js';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <CreditProvider>
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/tools" element={<ToolsDirectoryPage />} />
                  <Route path="/category/:categorySlug" element={<CategoryPage />} />
                  <Route path="/tools/:toolSlug" element={<ToolDetailPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/admin" element={<AdminDashboardPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/licenses" element={<LicensesPage />} />
                  <Route path="/contributing" element={<ContributingPage />} />
                  <Route path="/404" element={<NotFoundPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </CreditProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
