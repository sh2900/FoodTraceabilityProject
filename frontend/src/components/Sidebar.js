import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";

function Sidebar() {
  const location = useLocation();
  const [user] = useState(JSON.parse(localStorage.getItem("user") || "{}"));
  const { t } = useTranslation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="glass-panel" style={{
      width: "240px",
      height: "100vh",
      color: "var(--text-primary)",
      padding: "2rem 1.5rem",
      position: "fixed",
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
        <div style={{ 
          width: '32px', 
          height: '32px', 
          borderRadius: '8px', 
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '1.25rem'
        }}>
          🥩
        </div>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0 }}>TraceChain</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', paddingLeft: '0.75rem' }}>
          {t('sidebar.menu', 'Menu')}
        </p>
        <NavItem to="/dashboard" label={t('sidebar.dashboard', 'Dashboard')} icon="📊" active={isActive("/dashboard")} />
        
        {(user.role === 'admin' || user.role === 'retailer') && (
            <NavItem to="/blockchain" label={t('sidebar.blockchain', 'Blockchain')} icon="⛓" active={isActive("/blockchain")} />
        )}
        
        {user.role === 'admin' && (
            <NavItem to="/analytics" label={t('sidebar.analytics', 'Analytics')} icon="📈" active={isActive("/analytics")} />
        )}

        {user.role === 'farmer' && (
            <NavItem to="/my-products" label={t('sidebar.my_harvests', 'My Harvests')} icon="🚜" active={isActive("/my-products")} />
        )}
      </div>

      <div style={{ marginTop: 'auto' }}>
        <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.href = "/";
            }}
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--critical)' }}
        >
            <span>🚪</span> {t('sidebar.logout', 'Logout')}
        </button>
      </div>
    </div>
  );
}

function NavItem({ to, label, icon, active }) {
  return (
    <Link
      to={to}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.75rem 1rem",
        borderRadius: "var(--radius-md)",
        backgroundColor: active ? "var(--bg-app)" : "transparent",
        color: active ? "var(--primary)" : "var(--text-secondary)",
        textDecoration: "none",
        fontSize: '0.875rem',
        fontWeight: active ? '600' : '500',
        transition: 'all 0.2s',
        border: active ? '1px solid var(--border)' : '1px solid transparent'
      }}
    >
      <span style={{ fontSize: '1.1rem' }}>{icon}</span>
      {label}
    </Link>
  );
}

export default Sidebar;