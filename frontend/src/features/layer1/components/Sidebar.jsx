import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Target, Activity, FileText, Clock, LogOut, UploadCloud } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import '../styles/sidebar.css';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Upload', path: '/upload', icon: UploadCloud },
  { name: 'Fraud Rings', path: '/fraud-rings', icon: Target },
  { name: 'Jobs', path: '/jobs', icon: Activity },
  { name: 'History', path: '/history', icon: Clock },
  { name: 'SAR Report', path: '/sar', icon: FileText },
];

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="app-sidebar">
      <nav className="app-sidebar__nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `app-sidebar__link ${isActive ? 'app-sidebar__link--active' : ''}`
              }
            >
              <Icon size={20} strokeWidth={2} className="app-sidebar__link-icon" />
              <span className="app-sidebar__link-text">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="app-sidebar__footer">
        <button className="app-sidebar__link app-sidebar__logout-btn" onClick={handleLogout}>
          <LogOut size={20} strokeWidth={2} className="app-sidebar__link-icon" style={{ color: '#ef4444' }} />
          <span className="app-sidebar__link-text" style={{ color: '#ef4444' }}>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
