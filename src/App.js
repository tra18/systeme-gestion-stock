import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginForm from './components/auth/LoginForm';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import NouvelleCommande from './pages/NouvelleCommande';
import ServiceAchat from './pages/ServiceAchat';
import ValidationDG from './pages/ValidationDG';
import Commandes from './pages/Commandes';
import Maintenance from './pages/Maintenance';
import Stock from './pages/Stock';
import Articles from './pages/Articles';
import Services from './pages/Services';
import Fournisseurs from './pages/Fournisseurs';
import Prestataires from './pages/Prestataires';
import Employes from './pages/Employes';
import Alertes from './pages/Alertes';
import Parametres from './pages/Parametres';
import RessourcesHumaines from './pages/RessourcesHumaines';
import Rapports from './pages/Rapports';
import Budgets from './pages/Budgets';

// Nouveaux composants avancés
import AdvancedDashboard from './components/dashboard/AdvancedDashboardSimple';
import StockPrediction from './components/ai/StockPredictionSimple';
import WorkflowManager from './components/workflow/WorkflowManager';
import OfflineManager from './components/offline/OfflineManager';

// Composant de protection des routes
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userProfile?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Composant principal de l'application
const AppContent = () => {
  const { currentUser } = useAuth();

  return (
    <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <div className="App">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        
        <Routes>
          <Route 
            path="/login" 
            element={currentUser ? <Navigate to="/dashboard" replace /> : <LoginForm />} 
          />
          
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route 
              path="nouvelle-commande" 
              element={
                <ProtectedRoute allowedRoles={['service', 'dg']}>
                  <NouvelleCommande />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="service-achat" 
              element={
                <ProtectedRoute allowedRoles={['achat', 'dg']}>
                  <ServiceAchat />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="validation-dg" 
              element={
                <ProtectedRoute allowedRoles={['dg']}>
                  <ValidationDG />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="commandes" 
              element={
                <ProtectedRoute allowedRoles={['service', 'achat', 'dg']}>
                  <Commandes />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="maintenance" 
              element={
                <ProtectedRoute allowedRoles={['service', 'achat', 'dg']}>
                  <Maintenance />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="stock" 
              element={
                <ProtectedRoute allowedRoles={['service', 'achat', 'dg']}>
                  <Stock />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="articles" 
              element={
                <ProtectedRoute allowedRoles={['service', 'achat', 'dg']}>
                  <Articles />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="services" 
              element={
                <ProtectedRoute allowedRoles={['dg']}>
                  <Services />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="fournisseurs" 
              element={
                <ProtectedRoute allowedRoles={['achat', 'dg']}>
                  <Fournisseurs />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="prestataires" 
              element={
                <ProtectedRoute allowedRoles={['achat', 'dg']}>
                  <Prestataires />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="employes" 
              element={
                <ProtectedRoute allowedRoles={['dg']}>
                  <Employes />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="ressources-humaines" 
              element={
                <ProtectedRoute allowedRoles={['dg']}>
                  <RessourcesHumaines />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="rapports" 
              element={
                <ProtectedRoute allowedRoles={['dg']}>
                  <Rapports />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="budgets" 
              element={
                <ProtectedRoute allowedRoles={['dg']}>
                  <Budgets />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="alertes" 
              element={
                <ProtectedRoute allowedRoles={['service', 'achat', 'dg']}>
                  <Alertes />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="parametres" 
              element={
                <ProtectedRoute allowedRoles={['dg']}>
                  <Parametres />
                </ProtectedRoute>
              } 
            />
            
            {/* Nouvelles routes avancées */}
            <Route 
              path="dashboard-avance" 
              element={
                <ProtectedRoute allowedRoles={['dg']}>
                  <AdvancedDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="predictions-ia" 
              element={
                <ProtectedRoute allowedRoles={['dg']}>
                  <StockPrediction />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="workflows" 
              element={
                <ProtectedRoute allowedRoles={['dg']}>
                  <WorkflowManager />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="hors-ligne" 
              element={
                <ProtectedRoute allowedRoles={['dg']}>
                  <OfflineManager />
                </ProtectedRoute>
              } 
            />
          </Route>
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

// Composant racine avec les providers
const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
