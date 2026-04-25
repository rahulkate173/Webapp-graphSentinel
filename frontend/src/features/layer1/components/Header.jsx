import React, { useState, useRef, useEffect } from 'react';
import { Network, MoreVertical, ArrowLeft, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import '../styles/header.css';

const Header = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);

    // Get initials for avatar
    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="app-header">
            {/* Desktop Header */}
            <div className="app-header__desktop">
                <div className="app-header__logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <Network size={24} strokeWidth={2.5} />
                    <h1>GraphSentinel</h1>
                </div>

                <nav className="app-header__nav">
                    {/* Navigation links removed */}
                </nav>

                <div className="app-header__actions">
                    {user && (
                        <div className="app-header__profile-container" ref={profileRef}>
                            <button 
                                className="app-header__profile-btn"
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                aria-label="Profile menu"
                            >
                                <div className="app-header__avatar">
                                    {getInitials(user.fullname)}
                                </div>
                            </button>

                            {isProfileOpen && (
                                <div className="app-header__dropdown">
                                    <div className="app-header__dropdown-header">
                                        <p className="app-header__dropdown-name">{user.fullname}</p>
                                        <p className="app-header__dropdown-email">{user.email}</p>
                                    </div>
                                    <div className="app-header__dropdown-body">
                                        <div className="app-header__dropdown-item">
                                            <User size={16} />
                                            <span>Role: {user.role || 'User'}</span>
                                        </div>
                                    </div>
                                    <div className="app-header__dropdown-footer">
                                        <button 
                                            className="app-header__logout-btn"
                                            onClick={handleLogout}
                                        >
                                            <LogOut size={16} />
                                            <span>Sign out</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Header elements hidden via CSS */}
            <div className="app-header__mobile">
                <button className="app-header__mobile-btn" style={{ marginLeft: '-0.5rem' }} onClick={() => navigate('/')}>
                    <ArrowLeft size={24} />
                </button>
                <h1>GraphSentinel</h1>
                <button className="app-header__mobile-btn" style={{ marginRight: '-0.5rem' }}>
                    <MoreVertical size={24} />
                </button>
            </div>
        </header>
    );
};

export default Header;
