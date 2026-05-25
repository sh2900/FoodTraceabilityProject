import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import ProductTimeline from '../components/ProductTimeline';
import StatusBadge from '../components/StatusBadge';
import MapView from '../components/MapView';

function Traceability() {
  const { batchId } = useParams();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBatch = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/product/${batchId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBatch(res.data);
      } catch (err) {
        console.error("Error fetching batch details", err);
        setError("Batch not found or server error.");
      } finally {
        setLoading(false);
      }
    };

    fetchBatch();
  }, [batchId]);

  if (loading) return <Layout><div style={{ padding: '2rem', textAlign: 'center' }}>Loading traceability data...</div></Layout>;
  if (error) return <Layout><div style={{ padding: '2rem', textAlign: 'center', color: 'var(--critical)' }}>{error}</div></Layout>;
  if (!batch) return <Layout><div style={{ padding: '2rem', textAlign: 'center' }}>Batch not found.</div></Layout>;

  return (
    <Layout>
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ marginBottom: '0.5rem' }}>Product Traceability</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Full lifecycle transparency for batch <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{batch.batchId}</span></p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <StatusBadge status={batch.status} verified={true} />
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Last updated: {new Date(batch.history[batch.history.length - 1]?.timestamp).toLocaleString()}
            </div>
          </div>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
          <section>
            <div className="card">
              <h3 style={{ marginBottom: '1.5rem' }}>Journey Timeline</h3>
              <ProductTimeline history={batch.history} />
            </div>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="card">
              <h3 style={{ marginBottom: '1.5rem' }}>Current Location</h3>
              <MapView lat={batch.location.lat} lng={batch.location.lng} />
              <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                📍 {batch.location.lat.toFixed(4)}, {batch.location.lng.toFixed(4)}
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: '1.5rem' }}>Blockchain Verification</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {batch.blockchainRecords && batch.blockchainRecords.length > 0 ? (
                  batch.blockchainRecords.map((record, idx) => (
                    <div key={idx} style={{ padding: '1rem', background: 'var(--bg-app)', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>{record.stage} stage</span>
                        <span style={{ color: 'var(--text-muted)' }}>{new Date(record.timestamp).toLocaleString()}</span>
                      </div>
                      <code style={{ fontSize: '0.7rem', color: 'var(--text-primary)', wordBreak: 'break-all' }}>{record.hash}</code>
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No blockchain records found for this batch.</p>
                )}
              </div>
            </div>

            <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #3b82f6 100%)', color: 'white' }}>
              <h3>Batch Specifications</h3>
              <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Temperature</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{batch.temperature}°C</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Humidity</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{batch.humidity}%</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Quantity</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{batch.quantity} units</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Product</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700 }}>{batch.productName}</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}

export default Traceability;
