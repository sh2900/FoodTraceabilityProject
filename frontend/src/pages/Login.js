import React, { useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { t } = useTranslation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await axios.post(process.env.REACT_APP_API_URL + "/api/auth/login", {
        username,
        password
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      window.location.href = "/dashboard";
    } catch (err) {
      setErrorMsg(err.response?.data?.msg || "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      background: "transparent",
      position: "relative"
    }}>
      
      {/* Language Switcher - Extreme Left */}
      <div style={{ position: "absolute", top: "2rem", left: "2rem", zIndex: 50 }}>
        <LanguageSwitcher />
      </div>

      {/* Left Side: Branding / Graphic */}
      <div className="fade-in" style={{
        flex: 1.2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "4rem",
        background: "linear-gradient(135deg, var(--aurora-1) 0%, transparent 100%)",
        borderRight: "1px solid var(--border)",
        backdropFilter: "blur(10px)"
      }}>
        <div style={{ maxWidth: '600px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 10px 25px var(--btn-shadow)'
          }}>
            🥩
          </div>
          <h1 style={{ fontSize: '3.5rem', lineHeight: 1.1, marginBottom: '1.5rem', background: 'linear-gradient(to right, var(--text-primary), var(--text-muted))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Securing the World's Food Supply.
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {t('login.subtitle', 'TraceChain provides immutable, end-to-end traceability for every product from the farm to the consumer.')}
          </p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="fade-in" style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem"
      }}>
        
        <div className="glass-card card-premium" style={{ width: "100%", maxWidth: "420px", padding: "3rem" }}>
          
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{t('login.title', 'Welcome back')}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Sign in to manage your supply chain.</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label className="label">
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
              <label className="label">
                {t('login.password', 'Password')}
              </label>
              <input
                className="input-field"
                type="password"
                placeholder="••••••••"
                onChange={e => setPassword(e.target.value)}
                required
              />
              {errorMsg && (
                <div style={{ color: 'var(--critical)', fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 600 }}>
                  {errorMsg}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: "100%", padding: '1rem', marginTop: '1rem', fontSize: '1rem' }}
            >
              {loading ? "Connecting..." : t('login.button', 'Sign In to Dashboard')}
            </button>
          </form>

          <div style={{ marginTop: "2rem", textAlign: 'center', fontSize: "0.9rem" }}>
            <a href="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
              {t('login.create_account', 'New here? Create an Account')}
            </a>
          </div>
          <div style={{ marginTop: "1.5rem", textAlign: 'center', fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Role-Based Access Control Active
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;