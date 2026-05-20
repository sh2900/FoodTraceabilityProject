import React, { useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        username,
        password
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      window.location.href = "/dashboard";
    } catch (err) {
      alert(err.response?.data?.msg || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      position: "relative"
    }}>
      <div style={{ position: "absolute", top: "2rem", right: "2rem" }}>
        <LanguageSwitcher />
      </div>

      <div className="card fade-in" style={{ width: "400px", padding: "3rem" }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.5rem',
            margin: '0 auto 1rem'
          }}>
            🥩
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{t('login.title', 'TraceChain')}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t('login.subtitle', 'Secure Food Traceability Portal')}</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
              {t('login.email', 'Username')}
            </label>
            <input
              className="input-field"
              type="text"
              placeholder="Enter your username"
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
              {t('login.password', 'Password')}
            </label>
            <input
              className="input-field"
              type="password"
              placeholder="••••••••"
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: "100%", padding: '0.875rem', marginTop: '0.5rem' }}
          >
            {loading ? "Connecting..." : t('login.button', 'Sign In')}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", textAlign: 'center', fontSize: "0.875rem" }}>
          <a href="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
            {t('login.create_account', 'New here? Create an Account')}
          </a>
        </div>
        <div style={{ marginTop: "1.5rem", textAlign: 'center', fontSize: "0.75rem", color: "var(--text-muted)" }}>
          Role-Based Access Control Active
        </div>
      </div>
    </div>
  );
}

export default Login;