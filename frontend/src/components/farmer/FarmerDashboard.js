import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatusBadge from '../StatusBadge';
import VoiceInputField from '../VoiceInputField';
import { useTranslation } from 'react-i18next';
import { getCurrentLocation } from '../../utils/geolocation';

function FarmerDashboard() {
  const { t } = useTranslation();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', quantity: '', lat: '17.3850', lng: '78.4867', temp: '4' });

  useEffect(() => {
    fetchBatches();
    getCurrentLocation().then(loc => {
      setForm(f => ({ ...f, lat: loc.lat.toString(), lng: loc.lng.toString() }));
    }).catch(err => console.warn("Location error:", err));
  }, []);

  const fetchBatches = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(process.env.REACT_APP_API_URL + "/api/product/my/products", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBatches(res.data);
    } catch (err) {
      console.error("Error fetching farmer batches", err);
    } finally {
      setLoading(false);
    }
  };

    const handleCreate = async (e) => {
    e.preventDefault();
    
    const qty = parseInt(form.quantity);
    const lat = parseFloat(form.lat);
    const lng = parseFloat(form.lng);

    if (isNaN(qty) || qty <= 0) {
      alert("Please enter a valid quantity.");
      return;
    }
    if (isNaN(lat) || isNaN(lng)) {
      alert("Please enter valid coordinates.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(process.env.REACT_APP_API_URL + "/api/product/create", {
        batchId: `FARM-${Math.floor(Math.random() * 10000)}`,
        productName: form.name,
        quantity: qty,
        location: { lat, lng },
        temperature: parseFloat(form.temp) || 4,
        humidity: 60
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Harvest Registered!");
      fetchBatches();
      setForm({ name: '', quantity: '', lat: '17.3850', lng: '78.4867', temp: '4' });
    } catch (err) {
      console.error("Registration error:", err);
      alert(err.response?.data?.msg || "Error registering harvest");
    }
  };

  const [shippingTemp, setShippingTemp] = useState({});

  const handleShip = async (batchId) => {
    try {
      const token = localStorage.getItem("token");
      const temp = parseFloat(shippingTemp[batchId]) || 4;
      
      let loc = { lat: 17.4448, lng: 78.3498 }; // Fallback
      try { loc = await getCurrentLocation(); } catch(e) { console.warn(e); }

      await axios.post(process.env.REACT_APP_API_URL + "/api/product/update", {
        batchId,
        currentStage: 'warehouse',
        location: loc, 
        temperature: temp,
        humidity: 60
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      alert(`Batch ${batchId} shipped to warehouse at ${temp}°C!`);
      fetchBatches();
    } catch (err) {
      console.error("Shipping error:", err);
      alert("Error shipping batch.");
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <header className="section-header">
        <h1 className="section-title">🚜 {t('farmer.title', 'Farmer Command Center')}</h1>
        <p>{t('farmer.subtitle', 'Register your fresh harvest on the blockchain and manage outgoing shipments.')}</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        {/* Registration Card */}
        <section className="card card-premium">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span>🌱</span> {t('farmer.register_title', 'Register Harvest')}
          </h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label className="label">{t('farmer.product_identity', 'Product Identity')}</label>
              <VoiceInputField placeholder={t('farmer.placeholder_name', 'e.g. Organic Cavendish Bananas')} value={form.name} onChange={e => setForm({...form, name: e.target.value})} onVoiceText={t => setForm({...form, name: t})} required />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="label">{t('farmer.total_qty', 'Total Quantity')}</label>
                <VoiceInputField type="number" placeholder={t('farmer.placeholder_qty', '0.00')} value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} onVoiceText={t => setForm({...form, quantity: t})} required />
              </div>
              <div>
                <label className="label">{t('farmer.unit_temp', 'Unit Temp (°C)')}</label>
                <VoiceInputField type="number" value={form.temp} onChange={e => setForm({...form, temp: e.target.value})} onVoiceText={t => setForm({...form, temp: t})} required />
              </div>
            </div>

            <div>
              <label className="label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                {t('farmer.field_location', 'Field Location (Lat / Lng)')}
                <span 
                  style={{ cursor: 'pointer', color: 'var(--primary)', fontSize: '0.8rem' }}
                  onClick={() => getCurrentLocation().then(l => setForm({...form, lat: l.lat, lng: l.lng}))}
                >
                  📍 Detect
                </span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <VoiceInputField type="number" step="0.0001" value={form.lat} onChange={e => setForm({...form, lat: e.target.value})} onVoiceText={t => setForm({...form, lat: t})} required />
                <VoiceInputField type="number" step="0.0001" value={form.lng} onChange={e => setForm({...form, lng: e.target.value})} onVoiceText={t => setForm({...form, lng: t})} required />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              {t('farmer.init_record', 'Initialize Blockchain Record 🔗')}
            </button>
          </form>
        </section>

        {/* Recent Batches List */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>🌾 {t('farmer.recent_harvests', 'Recent Harvests')}</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('farmer.total', 'Total')}: {batches.length}</span>
          </div>

          {loading ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p>{t('farmer.syncing', 'Synchronizing with ledger...')}</p>
            </div>
          ) : batches.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">🚜</span>
              <h4>{t('farmer.no_harvests', 'No harvests recorded')}</h4>
              <p>{t('farmer.no_harvests_desc', 'Your recent field registrations will appear here once initialized.')}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {batches.map((b) => (
                <div key={b._id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'flex-start' }}>
                    <div>
                      <span 
                        style={{ 
                          fontSize: '0.7rem', 
                          fontWeight: 800, 
                          color: 'var(--primary)', 
                          letterSpacing: '0.05em', 
                          cursor: 'pointer',
                          background: 'var(--primary-light)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          display: 'inline-block',
                          marginBottom: '0.5rem'
                        }} 
                        onClick={() => window.location.href = `/trace/${b.batchId}`}
                      >
                        {b.batchId}
                      </span>
                      <h4 style={{ fontSize: '1.1rem' }}>{b.productName}</h4>
                    </div>
                    <StatusBadge status={b.status} verified={true} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <div className="label" style={{ margin: 0, fontSize: '0.65rem' }}>{t('farmer.quantity_label', 'Quantity')}</div>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{b.quantity} {t('farmer.units', 'Units')}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <div className="label" style={{ margin: 0, fontSize: '0.65rem' }}>{t('farmer.last_location', 'Last Location')}</div>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>📍 {b.location.lat.toFixed(2)}, {b.location.lng.toFixed(2)}</span>
                    </div>
                  </div>

                  {b.currentStage === 'farmer' ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <VoiceInputField 
                          type="number" 
                          placeholder="°C"
                          style={{ width: '80px', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.875rem' }}
                          value={shippingTemp[b.batchId] || ''}
                          onChange={(e) => setShippingTemp({...shippingTemp, [b.batchId]: e.target.value})}
                          onVoiceText={(t) => setShippingTemp({...shippingTemp, [b.batchId]: t})}
                        />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>°C</span>
                      </div>
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                        onClick={() => handleShip(b.batchId)}
                      >
                        {t('farmer.ship_btn', 'Ship to Warehouse 🏢')}
                      </button>
                    </div>
                  ) : (
                    <div style={{ padding: '1rem 0 0 0', borderTop: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                      Shipped • Current Stage: <span style={{textTransform:'capitalize'}}>{b.currentStage}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default FarmerDashboard;
