import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import VoiceInputField from '../VoiceInputField';

function RetailerDashboard() {
  const { t } = useTranslation();
  const [searchID, setSearchID] = useState("");
  const navigate = useNavigate();

  const handleTrace = (e) => {
    e.preventDefault();
    if (!searchID) return;
    navigate(`/trace/${searchID}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <section>
        <h1 style={{ marginBottom: '0.5rem' }}>{t('retailer.title', 'Product Traceability')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{t('retailer.subtitle', 'Verify product authenticity and trace the entire supply chain journey from farm to shelf.')}</p>
      </section>

      <section className="card" style={{ maxWidth: '600px', margin: '0 auto', width: '100%', padding: '3rem' }}>
        <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>🔍 {t('retailer.search_title', 'Search Batch Registry')}</h3>
        <form onSubmit={handleTrace}>
            <div style={{ display: 'flex', gap: '1rem', maxWidth: '600px', margin: '0 auto' }}>
              <VoiceInputField 
                className="input-field" 
                placeholder={t('retailer.search_placeholder', 'Enter Batch ID (e.g. FARM-1234)')}
                value={searchID} 
                onChange={(e) => setSearchID(e.target.value)} 
                onVoiceText={(t) => setSearchID(t)}
                style={{ flex: 1, padding: '1rem', fontSize: '1.1rem' }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
            {t('retailer.trace_btn', 'Trace Journey')}
          </button>
            </div>
        </form>
      </section>

      <section style={{ textAlign: 'center', padding: '4rem', opacity: 0.6 }}>
        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🚛</div>
        <h2>{t('retailer.connected_chain', 'Connected Supply Chain')}</h2>
        <p>{t('retailer.enter_batch', 'Enter a Batch ID to see the complete journey from Farm to Retail.')}</p>
      </section>
    </div>
  );
}

export default RetailerDashboard;
