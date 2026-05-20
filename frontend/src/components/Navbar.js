import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [user] = useState(JSON.parse(localStorage.getItem("user") || "{}"));
  const { t } = useTranslation();

  const baseRoute = window.location.pathname.split('/')[1] || 'dashboard';
  const titleKey = 'nav.' + baseRoute.replace('-', '_');
  const defaultTitle = baseRoute.charAt(0).toUpperCase() + baseRoute.slice(1);

  return (
    <nav style={{
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
          {t(titleKey, defaultTitle)}
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <button
          onClick={toggleTheme}
          className="btn btn-secondary"
          style={{ padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px' }}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        <LanguageSwitcher />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user.username}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{t(`roles.${user.role}`, user.role)}</div>
          </div>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.875rem'
          }}>
            {user.username?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;