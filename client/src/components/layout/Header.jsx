import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useTheme } from '../../hooks/useTheme.js';
import ThemePicker from '../ui/ThemePicker.jsx';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, selectTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <header className="app-header">
      <Link to="/" className="app-logo">Balls in the Air</Link>
      {user && (
        <nav className="header-nav">
          <ThemePicker current={theme} onSelect={selectTheme} />
          <Link to="/history">History</Link>
          <button onClick={handleLogout} className="btn-ghost">Sign out</button>
        </nav>
      )}
    </header>
  );
}
