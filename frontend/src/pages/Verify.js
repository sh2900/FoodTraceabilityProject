import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductTimeline from '../components/ProductTimeline';
import StatusBadge from '../components/StatusBadge';
import MapView from '../components/MapView';

function Verify() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBatch = async () => {
      try {
        // Using the new PUBLIC endpoint, no token required!
        const res = await axios.get(`http://localhost:5000/api/product/public/${batchId}`);
        setBatch(res.data);
      } catch (err) {
        console.error("Error fetching public batch details", err);
        setError("We couldn't find a blockchain record for this Batch ID.");
      } finally {
        setLoading(false);
      }
    };

    fetchBatch();
  }, [batchId]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-body)' }}>
      {/* Public Header */}
      <header style={{ padding: '1.5rem 2rem', background: 'var(--bg-app)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)', cursor: 'pointer' }} onClick={() => navigate('/verify')}>
          TraceChain <span style={{ color: 'var(--text-primary)' }}>Consumer Verify</span>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/verify')}>Search Another</button>
      </header>

      <main style={{ flex: 1, padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', fontSize: '1.2rem' }}>Loading blockchain records...</div>
        ) : error ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--critical)', fontSize: '1.2rem' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>❌</span>
            {error}
          </div>
        ) : !batch ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>Batch not found.</div>
        ) : (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            <section className="card card-premium" style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
              <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Authentic Product Verified</h1>
              <h2>{batch.productName}</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Batch ID: <span style={{ fontWeight: 700 }}>{batch.batchId}</span></p>
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
                  <h3 style={{ marginBottom: '1.5rem' }}>Last Known Location</h3>
                  <MapView lat={batch.location.lat} lng={batch.location.lng} />
                  <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    📍 {batch.location.lat.toFixed(4)}, {batch.location.lng.toFixed(4)}
                  </div>
                </div>

                <div className="card" style={{ background: 'linear-gradient(135deg, var(--bg-app) 0%, var(--bg-body) 100%)' }}>
                  <h3 style={{ marginBottom: '1.5rem' }}>Immutable Ledger Records</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {batch.blockchainRecords && batch.blockchainRecords.length > 0 ? (
                      batch.blockchainRecords.map((record, idx) => (
                        <div key={idx} style={{ padding: '1rem', background: 'var(--bg-app)', borderRadius: '8px', borderLeft: '4px solid var(--secondary)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                            <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>{record.stage} stage</span>
                            <span style={{ color: 'var(--text-muted)' }}>{new Date(record.timestamp).toLocaleString()}</span>
                          </div>
                          <code style={{ fontSize: '0.7rem', color: 'var(--text-primary)', wordBreak: 'break-all' }}>{record.hash}</code>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Syncing with ledger...</p>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Verify;
