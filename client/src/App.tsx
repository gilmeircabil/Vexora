import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { ThemeProvider } from './context/ThemeContext.js';
import { ToastProvider } from './context/ToastContext.js';
import { AuthProvider } from './context/AuthContext.js';
import { AppLayout } from './components/layout/AppLayout.js';

import { HomePage } from './pages/HomePage.js';
import { ToolsDirectoryPage } from './pages/ToolsDirectoryPage.js';
import { CategoryPage } from './pages/CategoryPage.js';
import { ToolDetailPage } from './pages/ToolDetailPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { AboutPage } from './pages/AboutPage.js';
import { PrivacyPage } from './pages/PrivacyPage.js';
import { LicensesPage } from './pages/LicensesPage.js';
import { ContributingPage } from './pages/ContributingPage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';
import { DesignStudioPage } from './pages/DesignStudioPage.js';
import { DesignEditorPage } from './pages/DesignEditorPage.js';
import { ScrollToTop } from './components/common/ScrollToTop.js';

// Smart Media & Image Processing Tools Pages
import { AiToolsDashboardPage } from './pages/AiToolsDashboardPage.js';
import { AiImageEnhancerPage } from './pages/ai/AiImageEnhancerPage.js';
import { AiBackgroundRemoverPage } from './pages/ai/AiBackgroundRemoverPage.js';
import { AiObjectRemoverPage } from './pages/ai/AiObjectRemoverPage.js';
import { AiPhotoRestorationPage } from './pages/ai/AiPhotoRestorationPage.js';
import { AiOcrPage } from './pages/ai/AiOcrPage.js';

// Support & Public Leaderboard Pages
import { SupportPage } from './pages/support/SupportPage.js';
import { LeaderboardPage } from './pages/support/LeaderboardPage.js';

// Developer Hub & Showcase Pages
import { DevelopersDirectoryPage } from './pages/developers/DevelopersDirectoryPage.js';
import { DeveloperProfilePage } from './pages/developers/DeveloperProfilePage.js';
import { DeveloperProfileEditPage } from './pages/developers/DeveloperProfileEditPage.js';
import { ProjectsDirectoryPage } from './pages/developers/ProjectsDirectoryPage.js';
import { ProjectDetailPage } from './pages/developers/ProjectDetailPage.js';
import { ManageProjectsPage } from './pages/developers/ManageProjectsPage.js';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* Full-screen dedicated Design Studio Editor */}
              <Route path="/design-studio/editor/:projectId" element={<DesignEditorPage />} />

              <Route element={<AppLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/design-studio" element={<DesignStudioPage />} />

                {/* Smart Image & Document Tools */}
                <Route path="/ai-tools" element={<AiToolsDashboardPage />} />
                <Route path="/ai-tools/image-enhancer" element={<AiImageEnhancerPage />} />
                <Route path="/ai-tools/background-remover" element={<AiBackgroundRemoverPage />} />
                <Route path="/ai-tools/object-remover" element={<AiObjectRemoverPage />} />
                <Route path="/ai-tools/photo-restoration" element={<AiPhotoRestorationPage />} />
                <Route path="/ai-tools/ocr" element={<AiOcrPage />} />

                {/* Support & Voluntary Donation */}
                <Route path="/support" element={<SupportPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />

                {/* Developer Hub & Showcase */}
                <Route path="/developers" element={<DevelopersDirectoryPage />} />
                <Route path="/developers/profile/edit" element={<DeveloperProfileEditPage />} />
                <Route path="/developers/profile/:username" element={<DeveloperProfilePage />} />
                <Route path="/developers/projects" element={<ProjectsDirectoryPage />} />
                <Route path="/developers/projects/manage" element={<ManageProjectsPage />} />
                <Route path="/developers/projects/:slug" element={<ProjectDetailPage />} />

                <Route path="/tools" element={<ToolsDirectoryPage />} />
                <Route path="/category/:categorySlug" element={<CategoryPage />} />
                <Route path="/tools/:toolSlug" element={<ToolDetailPage />} />
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
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
