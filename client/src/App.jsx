import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';

// 12 Required Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CropDetection from './pages/CropDetection';
import FlowerDetection from './pages/FlowerDetection';
import CameraPage from './pages/CameraPage';
import ChatbotPage from './pages/ChatbotPage';
import DiseaseLibrary from './pages/DiseaseLibrary';
import HistoryPage from './pages/HistoryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ForumPage from './pages/ForumPage';
import ConsultationsPage from './pages/ConsultationsPage';
import Profile from './pages/Profile';
import SettingsPage from './pages/SettingsPage';
import NutrientDetection from './pages/NutrientDetection';
import RecoveryPage from './pages/RecoveryPage';
import PlantCarePage from './pages/PlantCarePage';
import OfflinePage from './pages/OfflinePage';
import VoicePage from './pages/VoicePage';
import ModelBenchmarksPage from './pages/ModelBenchmarksPage';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-8 h-8 border-4 border-agro-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F4EB] dark:bg-[#1A3328] text-[#252D27] dark:text-[#F7F4EB] transition-colors font-sans selection:bg-[#718468] selection:text-white">
      <Navbar
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />
      <div className="flex-1 flex">
        <Sidebar
          isOpen={isSidebarOpen}
          closeSidebar={() => setIsSidebarOpen(false)}
        />
        <main className="min-w-0 flex-1 lg:pl-64 transition-all duration-200">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <Routes>
              {/* 12 Core Required Layouts */}
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/crop-detection" element={<CropDetection />} />
              <Route path="/flower-detection" element={<FlowerDetection />} />
              <Route path="/camera" element={<CameraPage />} />
              <Route path="/chatbot" element={<ChatbotPage />} />
              <Route path="/disease-library" element={<DiseaseLibrary />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/forum" element={<ForumPage />} />
              <Route path="/consultations" element={<ConsultationsPage />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/nutrient-deficiency" element={<NutrientDetection />} />
              <Route path="/recovery" element={<RecoveryPage />} />
              <Route path="/plant-care" element={<PlantCarePage />} />
              <Route path="/offline" element={<OfflinePage />} />
              <Route path="/voice" element={<VoicePage />} />
              <Route path="/model-comparison" element={<ModelBenchmarksPage />} />

              {/* Authentication Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
      <div className="lg:pl-64">
        <Footer />
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppLayout />
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
