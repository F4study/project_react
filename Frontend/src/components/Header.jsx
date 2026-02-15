import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, Sun, Moon, Globe, ChevronDown, User, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useThemeStore, useAuthStore, useCartStore } from '../store';
import { Logo } from './Logo';

export const Header = () => {
  const { t, i18n } = useTranslation();
  const { isDark, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const { items } = useCartStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
            <NavLink to="/" className="flex items-center gap-2">
            <Logo size={32} className="text-emerald-500" />
            <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:inline">
              E-BOOK STORE
            </span>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `text-sm font-medium transition ${
                  isActive
                    ? 'text-cyan-600 dark:text-cyan-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              {t('nav.dashboard')}
            </NavLink>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                if (!user) {
                  window.location.href = '/login';
                } else {
                  window.location.href = '/store';
                }
              }}
              className="text-sm font-medium transition text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              {t('nav.store') || 'Store'}
            </button>
            {/* Cart removed from navbar per request */}
            {/* No teacher role in e-book store */}
            {user?.role === 'admin' && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `text-sm font-medium transition ${
                    isActive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`
                }
              >
                {t('nav.admin')}
              </NavLink>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="hidden sm:flex gap-2 border-r border-gray-200 dark:border-gray-700 pr-3">
              <button
                onClick={() => changeLanguage('en')}
                className={`px-2 py-1 text-xs font-medium rounded transition ${
                  i18n.language === 'en'
                    ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => changeLanguage('th')}
                className={`px-2 py-1 text-xs font-medium rounded transition ${
                  i18n.language === 'th'
                    ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                TH
              </button>
              <button
                onClick={() => changeLanguage('zh')}
                className={`px-2 py-1 text-xs font-medium rounded transition ${
                  i18n.language === 'zh'
                    ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                中
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              title="Toggle theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Profile / Auth */}
            {user ? (
              <div className="hidden sm:flex items-center gap-3">
                {/* Profile Dropdown */}
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    {/* Avatar Image or Initials */}
                    {user.avatar_url ? (
                      <img
                        src={`http://localhost:7000/uploads/${user.avatar_url}`}
                        alt={user.display_name || user.username}
                        className="w-8 h-8 rounded-full object-cover border border-gray-300 dark:border-gray-600"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                        {user.display_name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.display_name || user.username}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {user.role === 'admin' && '🛡️ Admin'}
                        {user.role === 'user' && '👤 User'}
                      </p>
                    </div>
                    <ChevronDown size={16} className={`transition ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                      {/* Profile Info */}
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">{t('header.nickname')}</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {user.display_name || user.username}
                          </p>
                      </div>

                      {/* Menu Items */}
                      <NavLink
                        to="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition border-b border-gray-200 dark:border-gray-700"
                      >
                        <User size={16} />
                        {t('header.viewProfile')}
                      </NavLink>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                      >
                        <LogOut size={16} />
                        {t('header.logout')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex gap-2">
                <NavLink
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  {t('auth.login')}
                </NavLink>
                <NavLink
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition"
                >
                  {t('auth.register')}
                </NavLink>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200 dark:border-gray-800">
            <NavLink to="/dashboard" className="block px-4 py-2 text-gray-600 dark:text-gray-300">
              {t('nav.dashboard')}
            </NavLink>
            <button onClick={() => { if (!user) window.location.href = '/login'; else window.location.href = '/store'; }} className="block w-full text-left px-4 py-2 text-gray-600 dark:text-gray-300">{t('nav.store')}</button>
            {/* removed game links */}
            {/* no teacher panel in e-book store */}
            {user?.role === 'admin' && (
              <NavLink to="/admin" className="block px-4 py-2 text-gray-600 dark:text-gray-300">
                {t('nav.admin')}
              </NavLink>
            )}
            {!user && (
              <>
                <NavLink to="/login" className="block px-4 py-2 text-gray-600 dark:text-gray-300">
                  {t('auth.login')}
                </NavLink>
                <NavLink to="/register" className="block px-4 py-2 text-gray-600 dark:text-gray-300">
                  {t('auth.register')}
                </NavLink>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
