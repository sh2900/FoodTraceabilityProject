import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VoiceInputField from '../components/VoiceInputField';

function VerifySearch() {
  const [searchID, setSearchID] = useState("");
  const navigate = useNavigate();

  const handleTrace = (e) => {
    e.preventDefault();
    if (!searchID) return;
    navigate(`/verify/${searchID}`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Public Header */}
      <header className="glass-nav" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)' }}>TraceChain <span style={{ color: 'var(--text-primary)' }}>Consumer Verify</span></div>
        <button className="btn btn-secondary" onClick={() => navigate('/login')}>Staff Login</button>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Know Your Food's Journey</h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Enter the Batch ID found on your product's packaging to trace its complete journey from the farm to your hands, secured by blockchain technology.
          </p>
        </div>

        <section className="glass-card card-premium" style={{ maxWidth: '600px', width: '100%', padding: '3rem' }}>
          <form onSubmit={handleTrace}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <VoiceInputField 
                className="input-field" 
                placeholder="Enter Batch ID (e.g. FARM-1234)"
                value={searchID} 
                onChange={(e) => setSearchID(e.target.value)} 
                onVoiceText={(t) => setSearchID(t)}
                style={{ padding: '1.25rem', fontSize: '1.2rem', textAlign: 'center' }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '1.25rem', fontSize: '1.2rem', fontWeight: 700 }}>
                Verify Authenticity 🔍
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default VerifySearch;
