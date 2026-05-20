import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatusBadge from '../StatusBadge';
import SummaryCard from '../SummaryCard';
import VoiceInputField from '../VoiceInputField';
import { useTranslation } from 'react-i18next';
import { getCurrentLocation } from '../../utils/geolocation';

function WarehouseDashboard() {
  const { t } = useTranslation();
  const [availableBatches, setAvailableBatches] = useState([]);
  const [myBatches, setMyBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStored: 0,
    avgTemp: 0,
    avgHumidity: 0,
    alerts: 0
  });

  useEffect(() => {
    fetchWarehouseData();
  }, []);

  const fetchWarehouseData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/product/my/products", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const warehouseBatches = res.data; 
      const currentUser = JSON.parse(localStorage.getItem("user"));
      
      setAvailableBatches(warehouseBatches.filter(b => !b.ownerID));
      const active = warehouseBatches.filter(b => b.ownerID === currentUser.id);
      setMyBatches(active);
      
      // Calculate stats based on active custody
      let tempSum = 0, humidSum = 0, count = 0, alertCount = 0;
      active.forEach(b => {
        tempSum += b.temperature || 0;
        humidSum += b.humidity || 0;
        count++;
        if (b.status !== 'Safe') alertCount++;
      });

      setStats({
        totalStored: warehouseBatches.length,
        avgTemp: count > 0 ? (tempSum / count).toFixed(1) : 0,
        avgHumidity: count > 0 ? (humidSum / count).toFixed(1) : 0,
        alerts: alertCount
      });
    } catch (err) {
      console.error("Error fetching warehouse data", err);
    } finally {
      setLoading(false);
    }
  };

  const [dispatchTemp, setDispatchTemp] = useState({});

  const handleClaim = async (batchId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/product/claim", { batchId }, { headers: { Authorization: `Bearer ${token}` } });
      alert(`Batch ${batchId} claimed successfully!`);
      fetchWarehouseData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Error claiming batch");
    }
  };

  const handleDispatch = async (batchId) => {
    try {
      const token = localStorage.getItem("token");
      const temp = parseFloat(dispatchTemp[batchId]) || 4;
      
      let loc = { lat: 17.3850, lng: 78.4867 }; // Fallback
      try { loc = await getCurrentLocation(); } catch(e) { console.warn(e); }

      await axios.post("http://localhost:5000/api/product/update", {
        batchId,
        currentStage: 'transporter',
        location: loc, 
        temperature: temp,
        humidity: 60
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      alert(`Batch ${batchId} dispatched at ${temp}°C!`);
      fetchWarehouseData();
    } catch (err) {
      console.error("Dispatch error:", err);
      alert("Error dispatching batch.");
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <header className="section-header">
        <h1 className="section-title">🏢 {t('warehouse.title', 'Warehouse Inventory Control')}</h1>
        <p>{t('warehouse.subtitle', 'Monitor environmental conditions of stored batches and manage dispatch logistics.')}</p>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <div className="card card-premium">
          <div className="label">{t('warehouse.inventory_health', 'Inventory Health')}</div>
          <h3 style={{ margin: '0.5rem 0' }}>{stats.totalStored} {t('warehouse.batches', 'Batches')}</h3>
          <p style={{ fontSize: '0.8rem' }}>{t('warehouse.high_security', 'Currently in high-security storage')}</p>
        </div>
        <div className="card">
          <div className="label">{t('warehouse.env_avg', 'Environmental Avg')}</div>
          <h3 style={{ margin: '0.5rem 0', color: 'var(--primary)' }}>🌡️ {stats.avgTemp}°C</h3>
          <p style={{ fontSize: '0.8rem' }}>{t('warehouse.humidity', 'Humidity')}: {stats.avgHumidity}%</p>
        </div>
        <div className="card">
          <div className="label">{t('warehouse.critical_alerts', 'Critical Alerts')}</div>
          <h3 style={{ margin: '0.5rem 0', color: stats.alerts > 0 ? 'var(--critical)' : 'var(--safe)' }}>
            🚨 {stats.alerts} {t('warehouse.active', 'Active')}
          </h3>
          <p style={{ fontSize: '0.8rem' }}>{t('warehouse.immediate_attention', 'Requires immediate attention')}</p>
        </div>
      </section>

      <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>🔓 {t('warehouse.available', 'Available to Claim')}</h3>
          <p style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>Incoming shipments awaiting intake.</p>
        </div>
        <div className="table-container">
          <table style={{ border: 'none' }}>
            <thead>
              <tr>
                <th>{t('warehouse.batch_id', 'Batch ID')}</th>
                <th>{t('warehouse.product_name', 'Product Name')}</th>
                <th>{t('warehouse.location', 'Location')}</th>
                <th>{t('warehouse.action', 'Action')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" style={{ padding: '3rem', textAlign: 'center' }}>{t('warehouse.syncing', 'Synchronizing inventory data...')}</td></tr>
              ) : availableBatches.length === 0 ? (
                <tr>
                  <td colSpan="4">
                    <div className="empty-state" style={{ border: 'none' }}>
                      <span className="empty-state-icon">🏢</span>
                      <h4>No Available Batches</h4>
                      <p>Waiting for incoming shipments from farmers.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                availableBatches.map((b) => (
                  <tr key={b._id}>
                    <td style={{ fontWeight: 700, color: 'var(--secondary)' }}>{b.batchId}</td>
                    <td style={{ fontWeight: 600 }}>{b.productName}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      📍 {b.location.lat.toFixed(2)}, {b.location.lng.toFixed(2)}
                    </td>
                    <td>
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
                        onClick={() => handleClaim(b.batchId)}
                      >
                        Receive & Claim
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>📦 {t('warehouse.my_active', 'My Active Custody')}</h3>
          <p style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>Tip: {t('warehouse.tip', 'Dispatch moves this batch to the transporter stage.')}</p>
        </div>
        <div className="table-container">
          <table style={{ border: 'none' }}>
            <thead>
              <tr>
                <th>{t('warehouse.batch_id', 'Batch ID')}</th>
                <th>{t('warehouse.product_name', 'Product Name')}</th>
                <th>{t('warehouse.location', 'Location')}</th>
                <th>{t('warehouse.conditions', 'Conditions')}</th>
                <th>{t('warehouse.status', 'Status')}</th>
                <th>{t('warehouse.dispatch_management', 'Dispatch Management')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ padding: '3rem', textAlign: 'center' }}>{t('warehouse.syncing', 'Synchronizing inventory data...')}</td></tr>
              ) : myBatches.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state" style={{ border: 'none' }}>
                      <span className="empty-state-icon">✅</span>
                      <h4>{t('warehouse.empty_title', 'Warehouse is empty')}</h4>
                      <p>You have not claimed any batches yet.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                myBatches.map((b) => (
                  <tr key={b._id}>
                    <td style={{ fontWeight: 700, color: 'var(--secondary)', cursor: 'pointer' }} onClick={() => window.location.href = `/trace/${b.batchId}`}>
                      {b.batchId}
                    </td>
                    <td style={{ fontWeight: 600 }}>{b.productName}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      📍 {b.location.lat.toFixed(2)}, {b.location.lng.toFixed(2)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <span style={{ 
                          fontWeight: 700, 
                          color: b.status === 'Critical' ? 'var(--critical)' : b.status === 'Warning' ? 'var(--warning)' : 'var(--primary)',
                          background: 'var(--bg-app)',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          {b.temperature}°C
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>|</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{b.humidity}% RH</span>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={b.status} verified={true} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <VoiceInputField 
                          type="number" 
                          className="input-field"
                          placeholder="°C"
                          style={{ width: '80px', padding: '0.5rem', fontSize: '0.8rem' }}
                          value={dispatchTemp[b.batchId] || ''}
                          onChange={(e) => setDispatchTemp({...dispatchTemp, [b.batchId]: e.target.value})}
                          onVoiceText={(t) => setDispatchTemp({...dispatchTemp, [b.batchId]: t})}
                        />
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
                          onClick={() => handleDispatch(b.batchId)}
                        >
                          {t('warehouse.dispatch_btn', 'Dispatch 🚚')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default WarehouseDashboard;
