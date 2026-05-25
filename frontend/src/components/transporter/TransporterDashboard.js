import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatusBadge from '../StatusBadge';
// eslint-disable-next-line no-unused-vars
import SummaryCard from '../SummaryCard';
import MapView from '../MapView';
import VoiceInputField from '../VoiceInputField';
import { useTranslation } from 'react-i18next';
import { getCurrentLocation } from '../../utils/geolocation';

function TransporterDashboard() {
  const { t } = useTranslation();
  const [availableShipments, setAvailableShipments] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeShipments: 0,
    delayed: 0,
    avgTransitTemp: 4.5
  });

  useEffect(() => {
    fetchShipmentData();
  }, []);

  const fetchShipmentData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/product/my/products", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const inTransit = res.data;
      const currentUser = JSON.parse(localStorage.getItem("user"));
      
      setAvailableShipments(inTransit.filter(s => !s.ownerID));
      const active = inTransit.filter(s => s.ownerID === currentUser.id);
      setShipments(active);
      
      setStats({
        activeShipments: active.length,
        delayed: active.filter(p => p.status !== 'Safe').length,
        avgTransitTemp: active.length > 0 ? (active.reduce((acc, p) => acc + p.temperature, 0) / active.length).toFixed(1) : 0
      });
    } catch (err) {
      console.error("Error fetching shipment data", err);
    } finally {
      setLoading(false);
    }
  };

  const [deliveryTemp, setDeliveryTemp] = useState({});

  const handleClaim = async (batchId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/product/claim", { batchId }, { headers: { Authorization: `Bearer ${token}` } });
      alert(`Shipment ${batchId} claimed successfully!`);
      fetchShipmentData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Error claiming shipment");
    }
  };

  const handleDeliver = async (batchId) => {
    try {
      const token = localStorage.getItem("token");
      const temp = parseFloat(deliveryTemp[batchId]) || 4;
      
      let loc = { lat: 17.3850, lng: 78.4867 }; // Fallback
      try { loc = await getCurrentLocation(); } catch(e) { console.warn(e); }

      await axios.post("http://localhost:5000/api/product/update", {
        batchId,
        currentStage: 'retailer',
        location: loc, 
        temperature: temp,
        humidity: 60
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      alert(`Batch ${batchId} delivered to retailer at ${temp}°C!`);
      fetchShipmentData();
    } catch (err) {
      console.error("Delivery error:", err);
      alert("Error delivering shipment.");
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <style>{`
        @keyframes border-flow {
          0% { border-color: var(--secondary); border-style: solid; }
          50% { border-color: var(--primary); border-style: dashed; }
          100% { border-color: var(--secondary); border-style: solid; }
        }
        .moving-card {
          border: 2px solid var(--secondary);
          animation: border-flow 3s linear infinite;
        }
      `}</style>
      <header className="section-header">
        <h1 className="section-title">🚚 {t('transporter.title', 'Logistics Operations')}</h1>
        <p>{t('transporter.subtitle', 'Live GPS movement tracking and environmental monitoring for active cold-chain shipments.')}</p>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <div className="label">{t('transporter.active_shipments', 'Active Shipments')}</div>
          <h3 style={{ margin: '0.5rem 0' }}>{stats.activeShipments} 📦</h3>
          <p style={{ fontSize: '0.8rem' }}>{t('transporter.in_transit', 'Currently in transit')}</p>
        </div>
        <div className="card">
          <div className="label">{t('transporter.mean_transit_temp', 'Mean Transit Temp')}</div>
          <h3 style={{ margin: '0.5rem 0', color: 'var(--primary)' }}>🌡️ {stats.avgTransitTemp}°C</h3>
          <p style={{ fontSize: '0.8rem' }}>{t('transporter.safe_parameters', 'Within safe parameters')}</p>
        </div>
        <div className="card">
          <div className="label">{t('transporter.route_risk', 'Route Risk')}</div>
          <h3 style={{ margin: '0.5rem 0', color: stats.delayed > 0 ? 'var(--warning)' : 'var(--safe)' }}>
            ⚠️ {stats.delayed} {t('transporter.warning', 'Warning')}
          </h3>
          <p style={{ fontSize: '0.8rem' }}>{t('transporter.temp_anomalies', 'Temperature anomalies detected')}</p>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', alignItems: 'start' }}>
        <section>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🔓 {t('transporter.available', 'Available for Pickup')}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
            {loading ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <p>Loading available shipments...</p>
              </div>
            ) : availableShipments.length === 0 ? (
              <div className="empty-state">
                <span className="empty-state-icon">🚚</span>
                <h4>No shipments available</h4>
                <p>Waiting for warehouses to dispatch batches.</p>
              </div>
            ) : (
              availableShipments.map((s) => (
                <div key={s._id} className="card card-premium">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--secondary)' }}>{s.batchId}</span>
                      <h4 style={{ marginTop: '0.2rem' }}>{s.productName}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>📍 {s.location.lat.toFixed(4)}, {s.location.lng.toFixed(4)}</p>
                    </div>
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleClaim(s.batchId)}
                    >
                      Pick Up & Claim
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🛣️ {t('transporter.route_manifest', 'My Active Route Manifest')}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {loading ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <p>{t('transporter.retrieving_gps', 'Retrieving GPS coordinates...')}</p>
              </div>
            ) : shipments.length === 0 ? (
              <div className="empty-state">
                <span className="empty-state-icon">✅</span>
                <h4>{t('transporter.no_shipments', 'No active shipments')}</h4>
                <p>You haven't claimed any shipments yet.</p>
              </div>
            ) : (
              shipments.map((s) => (
                <div key={s._id} className="card card-premium moving-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                    <div>
                      <span 
                        style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--secondary)', background: 'var(--secondary-light)', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer' }}
                        onClick={() => window.location.href = `/trace/${s.batchId}`}
                      >
                        {s.batchId}
                      </span>
                      <h4 style={{ marginTop: '0.5rem' }}>{s.productName}</h4>
                      
                      {/* Visual Route Flow */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)' }}>
                          <span>🏢</span> {t('transporter.warehouse', 'Warehouse')}
                        </div>
                        <span style={{ color: 'var(--secondary)', fontWeight: 900 }}>→</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary)', fontWeight: 700 }}>
                          <span>🚚</span> {t('transporter.in_transit_stage', 'In Transit')}
                        </div>
                        <span style={{ color: 'var(--text-muted)' }}>→</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
                          <span>🏪</span> {t('transporter.retailer', 'Retailer')}
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={s.status} verified={true} />
                  </div>

                  <div style={{ background: 'var(--bg-app)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.875rem' }}>
                      <div className="label" style={{ margin: 0, fontSize: '0.65rem' }}>{t('transporter.current_coordinates', 'Current Coordinates')}</div>
                      <span style={{ fontWeight: 600 }}>📍 {s.location.lat.toFixed(4)}, {s.location.lng.toFixed(4)}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="label" style={{ margin: 0, fontSize: '0.65rem' }}>{t('transporter.live_temp', 'Live Temp')}</div>
                      <span style={{ fontWeight: 800, color: s.status === 'Critical' ? 'var(--critical)' : 'var(--primary)', fontSize: '1.1rem' }}>
                        {s.temperature}°C
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', gap: '1rem' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <VoiceInputField 
                        type="number" 
                        placeholder="°C"
                        style={{ width: '80px', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.875rem' }}
                        value={deliveryTemp[s.batchId] || ''}
                        onChange={(e) => setDeliveryTemp({...deliveryTemp, [s.batchId]: e.target.value})}
                        onVoiceText={(t) => setDeliveryTemp({...deliveryTemp, [s.batchId]: t})}
                      />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('transporter.live_temp', 'Live Temp')}</span>
                    </div>
                    <button 
                      className="btn btn-primary" 
                      style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem' }}
                      onClick={() => handleDeliver(s.batchId)}
                    >
                      {t('transporter.complete_delivery', 'Complete Delivery ✅')}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🛰️ {t('transporter.live_tracking', 'Live Tracking Map')}
          </h3>
          <div className="card" style={{ padding: '0.5rem', height: '400px' }}>
            <MapView 
              markers={shipments.map(s => ({ 
                lat: s.location.lat, 
                lng: s.location.lng, 
                label: `${s.batchId} - ${s.productName}` 
              }))} 
              zoom={6} 
            />
          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.75rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            {t('transporter.map_updates', 'Map updates automatically based on batch GPS telemetry.')}
          </p>
        </section>
      </div>
    </div>
  );
}

export default TransporterDashboard;
