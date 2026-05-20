import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AlertsPanel = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/alert', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAlerts(res.data);
      } catch (err) {
        console.error('Error fetching alerts', err);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high': return 'var(--critical)';
      case 'moderate': return 'var(--warning)';
      case 'low': return 'var(--secondary)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div className="card" style={{ maxHeight: '400px', overflowY: 'auto' }}>
      <h3 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span>🚨</span> System Alerts 
        {alerts.length > 0 && (
          <span style={{ 
            backgroundColor: 'var(--critical)', 
            color: 'white', 
            fontSize: '0.7rem', 
            padding: '2px 8px', 
            borderRadius: '9999px',
            fontWeight: 800
          }}>
            {alerts.length}
          </span>
        )}
      </h3>
      {alerts.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No active alerts. System healthy.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {alerts.map((alert, idx) => (
            <div key={idx} style={{ 
              padding: '1rem', 
              background: 'var(--bg-app)', 
              borderRadius: 'var(--radius-md)', 
              borderLeft: `4px solid ${getSeverityColor(alert.severity)}`,
              border: `1px solid var(--border)`,
              borderLeftWidth: '4px'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: getSeverityColor(alert.severity), letterSpacing: '0.05em' }}>
                {alert.severity?.toUpperCase()} ALERT
              </div>
              <div style={{ fontSize: '0.875rem', margin: '0.5rem 0', color: 'var(--text-primary)', fontWeight: 500 }}>{alert.message}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Batch: {alert.productId} • {new Date(alert.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertsPanel;
