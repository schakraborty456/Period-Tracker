import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Button from './components/Button';

function HomePlaceholder() {
  const { currentUser, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-textMain">
      <div className="max-w-md w-full bg-surface rounded-2xl shadow-sm p-6 text-center border border-pink-100">
        <div className="w-16 h-16 bg-primary-soft text-primary rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm">
          🌸
        </div>
        <h1 className="text-2xl font-semibold text-primary font-heading mb-2">
          Period Tracker
        </h1>
        <p className="text-textMuted text-sm mb-5">
          Personalized cycle predictions & nutrition guide
        </p>

        {currentUser ? (
          <div className="space-y-4">
            <div className="bg-primary-soft/50 text-textMain text-xs px-4 py-3 rounded-xl">
              <span className="text-textMuted">Signed in as:</span>{' '}
              <span className="font-semibold text-primary">{currentUser.email}</span>
            </div>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => logout()}
            >
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="inline-block bg-primary-soft text-primary text-xs px-3 py-1.5 rounded-full font-medium mb-2">
              Auth Ready • Task 1.4 Complete
            </div>
            <div className="flex gap-3 justify-center">
              <Link to="/login" className="flex-1">
                <Button variant="primary" fullWidth>
                  Log In
                </Button>
              </Link>
              <Link to="/signup" className="flex-1">
                <Button variant="secondary" fullWidth>
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePlaceholder />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
