import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm.jsx';
import SignupForm from '../components/auth/SignupForm.jsx';
import { useAuth } from '../hooks/useAuth.js';

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const [mode, setMode] = useState('login');

  if (user) return <Navigate to="/" replace />;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <h1>Balls in the Air</h1>
          <p>Keep your tasks floating</p>
        </div>
        {mode === 'login'
          ? <LoginForm onSwitchToSignup={() => setMode('signup')} />
          : <SignupForm onSwitchToLogin={() => setMode('login')} />
        }
      </div>
    </div>
  );
}
