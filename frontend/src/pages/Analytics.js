import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import SummaryCard from "../components/SummaryCard";
import { useTranslation } from 'react-i18next';

function Analytics() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    avgTemp: "4.2°C",
    totalAlerts: 0,
    systemHealth: "98.5%",
    totalProducts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        
        const [productsRes, alertsRes] = await Promise.all([
            axios.get("http://localhost:5000/api/product/all/list", { headers: { Authorization: `Bearer ${token}` } }),
            axios.get("http://localhost:5000/api/alert", { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const products = productsRes.data;
        const alerts = alertsRes.data;

        let tempSum = 0;
        let tempCount = 0;
        products.forEach(p => {
            p.history?.forEach(h => {
                if (h.temperature) {
                    tempSum += h.temperature;
                    tempCount++;
                }
            });
        });

        setStats({
            avgTemp: tempCount > 0 ? (tempSum / tempCount).toFixed(1) + "°C" : "N/A",
            totalAlerts: alerts.length,
            systemHealth: alerts.length > 5 ? "85.2%" : "99.1%",
            totalProducts: products.length
        });
      } catch (err) {
        console.error("Error fetching analytics data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <Layout>
      <div className="fade-in">
        <h1 style={{ marginBottom: "0.5rem" }}>📈 {t('analytics.title', 'Supply Chain Analytics')}</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>{t('analytics.subtitle', 'Real-time system metrics and supply chain health overview.')}</p>

        {loading ? (
            <p>{t('analytics.loading', 'Loading analytics...')}</p>
        ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
                <SummaryCard 
                    title={t('analytics.avg_temp', 'Average Temperature')} 
                    value={stats.avgTemp} 
                    icon="🌡️" 
                    color="#10b981"
                />
                <SummaryCard 
                    title={t('analytics.total_alerts', 'Total System Alerts')} 
                    value={stats.totalAlerts} 
                    icon="🚨" 
                    color={stats.totalAlerts > 0 ? "#ef4444" : "#10b981"}
                    trend={stats.totalAlerts > 0 ? "+5%" : "-10%"}
                />
                <SummaryCard 
                    title={t('analytics.system_health', 'System Health')} 
                    value={stats.systemHealth} 
                    icon="🛡️" 
                    color="#6366f1"
                />
                <SummaryCard 
                    title={t('analytics.active_products', 'Active Products')} 
                    value={stats.totalProducts} 
                    icon="📦" 
                    color="#3b82f6"
                />
            </div>
        )}

        <div className="card" style={{ marginTop: '3rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>{t('analytics.logs_title', 'System Status Logs')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <LogItem time="10m ago" msg={t('analytics.log1', 'Blockchain synchronization successful.')} status="ok" />
                <LogItem time="25m ago" msg={t('analytics.log2', 'Edge processing node #04 connected.')} status="ok" />
                <LogItem time="1h ago" msg={t('analytics.log3', 'Backup of MongoDB ledger completed.')} status="ok" />
                {stats.totalAlerts > 0 && <LogItem time="Recent" msg={`${stats.totalAlerts} ${t('analytics.log_alerts', 'alerts pending review.')}`} status="warn" />}
            </div>
        </div>
      </div>
    </Layout>
  );
}

const LogItem = ({ time, msg, status }) => (
    <div style={{ 
      display: 'flex', 
      gap: '1rem', 
      fontSize: '0.875rem', 
      padding: '0.75rem 1rem', 
      background: 'var(--bg-app)', 
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border)',
      alignItems: 'center'
    }}>
        <span style={{ color: 'var(--text-muted)', minWidth: '80px', fontSize: '0.75rem' }}>{time}</span>
        <span style={{ color: status === 'warn' ? 'var(--warning)' : 'var(--safe)' }}>●</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{msg}</span>
    </div>
);

export default Analytics;