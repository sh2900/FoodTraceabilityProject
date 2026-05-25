import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { useTranslation } from "react-i18next";
import VoiceInputField from "../components/VoiceInputField";

function Blockchain() {
  const { t } = useTranslation();
  const [productId, setProductId] = useState("");
  const [logs, setLogs] = useState([]);
  const [allLogs, setAllLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllLogs();
  }, []);

  const fetchAllLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(process.env.REACT_APP_API_URL + "/api/blockchain/logs/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllLogs(res.data.reverse()); // Show latest first
    } catch (err) {
      console.error("Error fetching global logs", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductLogs = async () => {
    if (!productId) return fetchAllLogs();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/blockchain/logs/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(res.data.reverse());
    } catch (err) {
      alert("Error fetching blockchain logs");
    } finally {
      setLoading(false);
    }
  };

  const currentLogs = productId ? logs : allLogs;

  return (
    <Layout>
      <div className="fade-in">
        <h1 style={{ marginBottom: "0.5rem" }}>⛓ {t('blockchain.title', 'Blockchain Ledger Explorer')}</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>{t('blockchain.subtitle', 'Real-time verification of supply chain events on the Ethereum network.')}</p>

        <div className="card" style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
          <VoiceInputField 
            className="input-field"
            placeholder={t('blockchain.search_placeholder', 'Search by Product ID (leave empty for all transactions)')} 
            value={productId} 
            onChange={e => setProductId(e.target.value)}
            onVoiceText={(text) => setProductId(text)}
            style={{ flex: 1 }}
          />
          <button onClick={fetchProductLogs} className="btn btn-primary" disabled={loading}>
            {productId ? t('blockchain.verify_id', 'Verify ID') : t('blockchain.refresh', 'Refresh Ledger')}
          </button>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: 'var(--bg-app)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <tr>
                        <th style={{ padding: '1rem 1.5rem' }}>{t('blockchain.verification', 'Verification')}</th>
                        <th style={{ padding: '1rem 1.5rem' }}>{t('blockchain.product_id', 'Product ID')}</th>
                        <th style={{ padding: '1rem 1.5rem' }}>{t('blockchain.data_hash', 'Data Hash')}</th>
                        <th style={{ padding: '1rem 1.5rem' }}>{t('blockchain.timestamp', 'Timestamp')}</th>
                        <th style={{ padding: '1rem 1.5rem' }}>{t('blockchain.actor', 'Actor')}</th>
                    </tr>
                </thead>
                <tbody style={{ fontSize: '0.875rem' }}>
                    {loading ? (
                        <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>{t('blockchain.syncing', 'Synchronizing with blockchain...')}</td></tr>
                    ) : currentLogs.length === 0 ? (
                        <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>{t('blockchain.no_records', 'No immutable records found.')}</td></tr>
                    ) : (
                        currentLogs.map((log, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    <span className="verified-badge">
                                        ✓ VERIFIED
                                    </span>
                                </td>
                                <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--secondary)' }}>{log.productId}</td>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    <code style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-app)', padding: '2px 6px', borderRadius: '4px' }}>
                                        {log.dataHash.substring(0, 16)}...
                                    </code>
                                </td>
                                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{new Date(log.timestamp * 1000).toLocaleString()}</td>
                                <td style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.actor}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>

        <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div className="card">
                <h4 style={{ marginBottom: '1rem' }}>{t('blockchain.network_status', 'Network Status')}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{t('blockchain.protocol', 'Protocol')}</span>
                    <span style={{ color: 'var(--safe)', fontWeight: 600 }}>Ethereum (Ganache)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{t('blockchain.consensus', 'Consensus')}</span>
                    <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>Proof of Authority</span>
                </div>
            </div>
            <div className="card">
                <h4 style={{ marginBottom: '1rem' }}>{t('blockchain.contract_info', 'Contract Information')}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{t('blockchain.address', 'Address')}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontFamily: 'monospace' }}>{process.env.REACT_APP_CONTRACT_ADDR || '0x1a7Aead41671e7a8de442D7E7e84C43996F75b22'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{t('blockchain.compiler', 'Compiler')}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>solc 0.8.0</span>
                </div>
            </div>
        </div>
      </div>
    </Layout>
  );
}

export default Blockchain;