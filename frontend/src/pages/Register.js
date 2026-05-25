import React, { useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { Link } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("farmer");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(process.env.REACT_APP_API_URL + "/api/auth/register", {
        username,
        password,
        role
      });

      alert(res.data.msg || "Registration successful. Please wait for an Admin to approve your account.");
      window.location.href = "/login";
    } catch (err) {
      alert(err.response?.data?.msg || "Registration failed");
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
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{t('register.title', 'Create Account')}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t('register.subtitle', 'Join the Supply Chain Portal')}</p>
        </div>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
              {t('register.username', 'Username')}
            </label>
            <input
              className="input-field"
              type="text"
              placeholder="Enter a username"
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
              {t('register.password', 'Password')}
            </label>
            <input
              className="input-field"
              type="password"
              placeholder="••••••••"
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
              {t('register.role', 'Select Role')}
            </label>
            <select
              className="input-field"
              value={role}
              onChange={e => setRole(e.target.value)}
              style={{ padding: '0.75rem', width: '100%', borderRadius: 'var(--radius-md)' }}
            >
              <option value="farmer">{t('role.farmer', 'Farmer')}</option>
              <option value="transporter">{t('role.transporter', 'Transporter')}</option>
              <option value="warehouse">{t('role.warehouse', 'Warehouse')}</option>
              <option value="retailer">{t('role.retailer', 'Retailer')}</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: "100%", padding: '0.875rem', marginTop: '0.5rem' }}
          >
            {loading ? "Registering..." : t('register.button', 'Sign Up')}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", textAlign: 'center', fontSize: "0.875rem" }}>
          <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
            {t('register.back_login', 'Already have an account? Sign in')}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
