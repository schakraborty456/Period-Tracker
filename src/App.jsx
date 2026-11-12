import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import Tips from './pages/Tips';
import Log from './pages/Log';
import Insights from './pages/Insights';
import Settings from './pages/Settings';
import Privacy from './pages/Privacy';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Button from './components/Button';
import Card from './components/Card';
import BottomNav from './components/BottomNav';

function FeaturePlaceholder({ title, taskInfo, icon = '🌸' }) {
  return (
    <div className="min-h-screen bg-background text-textMain px-4 py-8 flex flex-col items-center justify-center pb-24">
      <Card className="max-w-sm w-full text-center space-y-4">
        <div className="w-12 h-12 bg-primary-soft text-primary rounded-xl flex items-center justify-center mx-auto text-2xl">
          {icon}
        </div>
        <h2 className="text-xl font-bold font-heading text-textMain">{title}</h2>
        <p className="text-xs text-textMuted leading-relaxed">
          This feature is scheduled for {taskInfo}.
        </p>
        <div className="pt-2">
          <Link to="/" className="inline-block">
            <Button variant="secondary" className="text-xs">
              ← Back to Dashboard
            </Button>
          </Link>
        </div>
      </Card>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/log"
            element={
              <ProtectedRoute>
                <Log />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tips"
            element={
              <ProtectedRoute>
                <Tips />
              </ProtectedRoute>
            }
          />
          <Route
            path="/insights"
            element={
              <ProtectedRoute>
                <Insights />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
