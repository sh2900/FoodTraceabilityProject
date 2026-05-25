import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatusBadge from '../StatusBadge';
import MapView from '../MapView';
import VoiceInputField from '../VoiceInputField';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { useTranslation } from 'react-i18next';
import { getCurrentLocation } from '../../utils/geolocation';

function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalBatches: 0,
    activeShipments: 0,
    activeAlerts: 0,
    sensorsActive: 12
  });
  const [batches, setBatches] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', quantity: '', location: '', temp: 4, humidity: 65 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [productsRes, alertsRes, pendingUsersRes] = await Promise.all([
        axios.get("http://localhost:5000/api/product/my/products", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:5000/api/alert", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:5000/api/admin/users/pending", { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] }))
      ]);

      setBatches(productsRes.data);
      setPendingUsers(pendingUsersRes.data);
      setStats({
        totalBatches: productsRes.data.length,
        activeShipments: productsRes.data.filter(p => p.currentStage === 'transporter').length,
        activeAlerts: alertsRes.data.length,
        sensorsActive: 12
      });
    } catch (err) {
      console.error("Error fetching admin data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      
      let loc = { lat: 17.3850, lng: 78.4867 }; // Fallback
      try { loc = await getCurrentLocation(); } catch(e) { console.warn(e); }

      await axios.post("http://localhost:5000/api/product/create", {
        batchId: `BATCH-${Math.floor(Math.random() * 10000)}`,
        productName: form.name,
        quantity: parseInt(form.quantity),
        location: loc,
        temperature: form.temp,
        humidity: form.humidity
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Batch Created Successfully!");
      fetchData();
      setForm({ name: '', quantity: '', location: '', temp: 4, humidity: 65 });
    } catch (err) {
      alert("Error creating batch");
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/admin/users/approve/${userId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      alert("User Approved!");
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Error approving user");
    }
  };

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Avg Temperature (°C)',
        data: [4.2, 4.5, 4.1, 4.3, 4.8, 4.6],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Humidity (%)',
        data: [65, 68, 66, 70, 72, 69],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <header className="section-header">
        <h1 className="section-title">⚖️ {t('admin.title', 'Administrative Control Panel')}</h1>
        <p>{t('admin.subtitle', 'Global oversight of supply chain batches, system alerts, and sensory telemetry analytics.')}</p>
      </header>

      {/* Top Overview */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <div className="label">{t('admin.throughput', 'Ecosystem Throughput')}</div>
          <h3 style={{ margin: '0.5rem 0' }}>{stats.totalBatches} {t('admin.batches', 'Batches')}</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>↑ 12% {t('admin.vs_last_month', 'vs last month')}</p>
        </div>
        <div className="card">
          <div className="label">{t('admin.pipeline', 'Logistics Pipeline')}</div>
          <h3 style={{ margin: '0.5rem 0' }}>{stats.activeShipments} {t('admin.shipments', 'Shipments')}</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>↑ 5% {t('admin.active_transit', 'active transit')}</p>
        </div>
        <div className="card">
          <div className="label">{t('admin.integrity', 'System Integrity')}</div>
          <h3 style={{ margin: '0.5rem 0', color: stats.activeAlerts > 0 ? 'var(--critical)' : 'var(--safe)' }}>
            {stats.activeAlerts} {t('admin.active_alerts', 'Active Alerts')}
          </h3>
          <p style={{ fontSize: '0.8rem' }}>{stats.activeAlerts > 0 ? t('admin.action_required', 'Action required') : t('admin.all_normal', 'All systems normal')}</p>
        </div>
        <div className="card">
          <div className="label">{t('admin.iot_network', 'IoT Network')}</div>
          <h3 style={{ margin: '0.5rem 0' }}>{stats.sensorsActive} {t('admin.nodes', 'Nodes')}</h3>
          <p style={{ fontSize: '0.8rem' }}>{t('admin.connected', 'Connected & calibrated')}</p>
        </div>
      </section>

      {/* Analytics & Map */}
      <section style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
        <div className="card card-premium">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📈</span> {t('admin.telemetry', 'Sensor Telemetry (Global Avg)')}
          </h3>
          <div style={{ height: '300px' }}>
            <Line data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
          </div>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🛰️</span> {t('admin.map_title', 'Global Batch Distribution')}
          </h3>
          <div style={{ height: '300px', width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <MapView 
              markers={batches.map(b => ({ 
                lat: b.location.lat, 
                lng: b.location.lng, 
                label: `${b.productName} - ${b.batchId}` 
              }))} 
              zoom={4} 
            />
          </div>
        </div>
      </section>

      {/* Batch Management */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>{t('admin.quick_create', '🛠️ Quick Batch Creation')}</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="label">{t('admin.product_name', 'Product Name')}</label>
              <VoiceInputField placeholder={t('admin.placeholder_name', 'e.g. Fuji Apples')} value={form.name} onChange={e => setForm({...form, name: e.target.value})} onVoiceText={t => setForm({...form, name: t})} required />
            </div>
            <div>
              <label className="label">{t('admin.total_quantity', 'Total Quantity')}</label>
              <VoiceInputField placeholder={t('admin.placeholder_units', 'Units')} type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} onVoiceText={t => setForm({...form, quantity: t})} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="label">{t('admin.initial_temp', 'Initial Temp (°C)')}</label>
                <VoiceInputField type="number" value={form.temp} onChange={e => setForm({...form, temp: e.target.value})} onVoiceText={t => setForm({...form, temp: t})} />
              </div>
              <div>
                <label className="label">{t('admin.humidity', 'Humidity (%)')}</label>
                <VoiceInputField type="number" value={form.humidity} onChange={e => setForm({...form, humidity: e.target.value})} onVoiceText={t => setForm({...form, humidity: t})} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>{t('admin.create_btn', 'Create & Synchronize Ledger')}</button>
          </form>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h3>{t('admin.ledger', '📜 System Ledger (Recent)')}</h3>
          </div>
          <div className="table-container">
            <table style={{ border: 'none' }}>
              <thead>
                <tr>
                  <th>{t('admin.batch_id', 'Batch ID')}</th>
                  <th>{t('admin.product', 'Product')}</th>
                  <th>{t('admin.status', 'Status')}</th>
                </tr>
              </thead>
              <tbody>
                {batches.slice(0, 10).map((b) => (
                  <tr key={b._id} onClick={() => window.location.href = `/trace/${b.batchId}`} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 700, color: 'var(--secondary)' }}>{b.batchId}</td>
                    <td>{b.productName}</td>
                    <td>
                      <StatusBadge status={b.status} verified={true} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pending Users Management */}
      <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h3>👥 {t('admin.pending_users', 'Pending User Approvals')}</h3>
        </div>
        <div className="table-container">
          <table style={{ border: 'none' }}>
            <thead>
              <tr>
                <th>{t('admin.username', 'Username')}</th>
                <th>{t('admin.role', 'Requested Role')}</th>
                <th>{t('admin.action', 'Action')}</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No pending approvals.
                  </td>
                </tr>
              ) : (
                pendingUsers.map(user => (
                  <tr key={user._id}>
                    <td style={{ fontWeight: 600 }}>{user.username}</td>
                    <td style={{ textTransform: 'capitalize' }}>{user.role}</td>
                    <td>
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                        onClick={() => handleApproveUser(user._id)}
                      >
                        Approve ✅
                      </button>
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

export default AdminDashboard;
