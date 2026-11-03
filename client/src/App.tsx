import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { ThemeProvider } from './context/ThemeContext.js';
import { ToastProvider } from './context/ToastContext.js';
import { AuthProvider } from './context/AuthContext.js';
import { FavoritesProvider } from './context/FavoritesContext.js';
import { MaintenanceProvider } from './context/MaintenanceContext.js';
import { BroadcastNotificationProvider } from './context/BroadcastNotificationContext.js';
import { BroadcastToastContainer } from './components/notifications/BroadcastToastContainer.js';
import { MascotProvider } from './context/MascotContext.js';
import { FloatingMascotWidget } from './components/mascot/FloatingMascotWidget.js';
import { AppLayout } from './components/layout/AppLayout.js';

import { HomePage } from './pages/HomePage.js';
import { ToolsDirectoryPage } from './pages/ToolsDirectoryPage.js';
import { CategoryPage } from './pages/CategoryPage.js';
import { ToolDetailPage } from './pages/ToolDetailPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.js';
import { OAuthCallbackPage } from './pages/OAuthCallbackPage.js';
import { AboutPage } from './pages/AboutPage.js';
import { PrivacyPage } from './pages/PrivacyPage.js';
import { LicensesPage } from './pages/LicensesPage.js';
import { TermsPage } from './pages/TermsPage.js';
import { ContributingPage } from './pages/ContributingPage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';
import { ScrollToTop } from './components/common/ScrollToTop.js';
import { PageTitleUpdater } from './components/common/PageTitleUpdater.js';

// Studio & Education Suites (lazy-loaded for dynamic chunk splitting)
const DesignStudioPage = React.lazy(() =>
  import('./pages/DesignStudioPage.js').then((m) => ({ default: m.DesignStudioPage })),
);
const DesignEditorPage = React.lazy(() =>
  import('./pages/DesignEditorPage.js').then((m) => ({ default: m.DesignEditorPage })),
);
const StudySpacePage = React.lazy(() =>
  import('./pages/education/StudySpacePage.js').then((m) => ({ default: m.StudySpacePage })),
);

// AI-Powered Tool Pages (lazy-loaded for optimal chunk splitting)
const AiImageEnhancerPage = React.lazy(() =>
  import('./pages/ai/AiImageEnhancerPage.js').then((m) => ({ default: m.AiImageEnhancerPage })),
);
const AiBackgroundRemoverPage = React.lazy(() =>
  import('./pages/ai/AiBackgroundRemoverPage.js').then((m) => ({
    default: m.AiBackgroundRemoverPage,
  })),
);
const AiObjectRemoverPage = React.lazy(() =>
  import('./pages/ai/AiObjectRemoverPage.js').then((m) => ({ default: m.AiObjectRemoverPage })),
);
const AiPhotoRestorationPage = React.lazy(() =>
  import('./pages/ai/AiPhotoRestorationPage.js').then((m) => ({
    default: m.AiPhotoRestorationPage,
  })),
);
const AiOcrPage = React.lazy(() =>
  import('./pages/ai/AiOcrPage.js').then((m) => ({ default: m.AiOcrPage })),
);
const AiCodeExplainerPage = React.lazy(() =>
  import('./pages/ai/AiCodeExplainerPage.js').then((m) => ({ default: m.AiCodeExplainerPage })),
);
const AiDocumentSummarizerPage = React.lazy(() =>
  import('./pages/ai/AiDocumentSummarizerPage.js').then((m) => ({
    default: m.AiDocumentSummarizerPage,
  })),
);
const AiWritingAssistantPage = React.lazy(() =>
  import('./pages/ai/AiWritingAssistantPage.js').then((m) => ({
    default: m.AiWritingAssistantPage,
  })),
);
const AiChatPage = React.lazy(() =>
  import('./pages/ai/AiChatPage.js').then((m) => ({ default: m.AiChatPage })),
);

// Learning Hub & Community Pages
import { LearningHubPage } from './pages/learning/LearningHubPage.js';
import { LearningPostDetailPage } from './pages/learning/LearningPostDetailPage.js';
import { CommunityPage } from './pages/community/CommunityPage.js';
import { ReviewsPage } from './pages/ReviewsPage.js';

// Preserved Legacy Developer Profile & Project Showcase Routes
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
          <MaintenanceProvider>
            <FavoritesProvider>
              <BroadcastNotificationProvider>
                <MascotProvider>
                  <BrowserRouter>
                    <ScrollToTop />
                    <PageTitleUpdater />
                    <BroadcastToastContainer />
                    <Routes>
                      {/* Full-screen dedicated VexoraMods Studio Editor */}
                      <Route
                        path="/studio/editor/:projectId"
                        element={
                          <React.Suspense
                            fallback={
                              <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center font-mono text-xs font-bold text-neutral-500 uppercase tracking-wider">
                                Loading Studio Editor...
                              </div>
                            }
                          >
                            <DesignEditorPage />
                          </React.Suspense>
                        }
                      />
                      <Route
                        path="/design-studio/editor/:projectId"
                        element={
                          <React.Suspense
                            fallback={
                              <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center font-mono text-xs font-bold text-neutral-500 uppercase tracking-wider">
                                Loading Studio Editor...
                              </div>
                            }
                          >
                            <DesignEditorPage />
                          </React.Suspense>
                        }
                      />

                      {/* Standalone Auth Pages (No Navbar) */}
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
                      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                      <Route path="/reset-password" element={<ForgotPasswordPage />} />

                      <Route element={<AppLayout />}>
                        {/* 1. Home */}
                        <Route path="/" element={<HomePage />} />

                        {/* 2. All Tools (Unified Normal + AI Tools) */}
                        <Route path="/tools" element={<ToolsDirectoryPage />} />
                        <Route path="/tools/:toolSlug" element={<ToolDetailPage />} />
                        <Route path="/category/:categorySlug" element={<CategoryPage />} />

                        {/* AI Tools Redirect & Preserved Functional Tool Routes */}
                        <Route
                          path="/ai-tools"
                          element={<Navigate to="/tools?type=ai" replace />}
                        />
                        <Route path="/ai-tools/image-enhancer" element={<AiImageEnhancerPage />} />
                        <Route
                          path="/ai-tools/background-remover"
                          element={<AiBackgroundRemoverPage />}
                        />
                        <Route path="/ai-tools/object-remover" element={<AiObjectRemoverPage />} />
                        <Route
                          path="/ai-tools/photo-restoration"
                          element={<AiPhotoRestorationPage />}
                        />
                        <Route path="/ai-tools/ocr" element={<AiOcrPage />} />
                        <Route path="/ai-tools/code-explainer" element={<AiCodeExplainerPage />} />
                        <Route
                          path="/ai-tools/document-summarizer"
                          element={<AiDocumentSummarizerPage />}
                        />
                        <Route
                          path="/ai-tools/writing-assistant"
                          element={<AiWritingAssistantPage />}
                        />
                        <Route path="/ai-tools/chat" element={<AiChatPage />} />
                        <Route path="/ai-chat" element={<AiChatPage />} />
                        <Route path="/chat" element={<Navigate to="/ai-tools/chat" replace />} />

                        {/* 3. Studio */}
                        <Route path="/studio" element={<DesignStudioPage />} />
                        <Route path="/design-studio" element={<Navigate to="/studio" replace />} />

                        {/* 4. Learning Hub */}
                        <Route path="/learning" element={<LearningHubPage />} />
                        <Route path="/learning/:slug" element={<LearningPostDetailPage />} />

                        {/* 5. Study Space (Zero-Cost Education Suite) */}
                        <Route path="/study" element={<StudySpacePage />} />
                        <Route path="/study-space" element={<Navigate to="/study" replace />} />

                        {/* Legacy Developer Hub Redirect + Preserved Profile/Project Routes */}
                        <Route path="/developers" element={<Navigate to="/learning" replace />} />
                        <Route
                          path="/developers/profile/edit"
                          element={<DeveloperProfileEditPage />}
                        />
                        <Route
                          path="/developers/profile/:username"
                          element={<DeveloperProfilePage />}
                        />
                        <Route path="/developers/projects" element={<ProjectsDirectoryPage />} />
                        <Route
                          path="/developers/projects/manage"
                          element={<ManageProjectsPage />}
                        />
                        <Route path="/developers/projects/:slug" element={<ProjectDetailPage />} />

                        {/* 5. Community (Donations + Leaderboard Combined) */}
                        <Route path="/community" element={<CommunityPage />} />
                        <Route path="/support" element={<Navigate to="/community" replace />} />
                        <Route path="/leaderboard" element={<Navigate to="/community" replace />} />

                        {/* 6. Public Ratings & Reviews */}
                        <Route path="/reviews" element={<ReviewsPage />} />

                        {/* Account, Admin & Legal */}
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/admin" element={<AdminDashboardPage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/privacy" element={<PrivacyPage />} />
                        <Route path="/licenses" element={<LicensesPage />} />
                        <Route path="/terms" element={<TermsPage />} />
                        <Route path="/contributing" element={<ContributingPage />} />
                        <Route path="/404" element={<NotFoundPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                      </Route>
                    </Routes>
                  </BrowserRouter>
                </MascotProvider>
              </BroadcastNotificationProvider>
            </FavoritesProvider>
          </MaintenanceProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
