import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";
import { useTranslation } from "react-i18next";

function MyProducts() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/product/my/products", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProducts(res.data);
      } catch (err) {
        console.error("Error fetching products", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyProducts();
  }, []);

  return (
    <Layout>
      <div className="fade-in">
        <h1 style={{ marginBottom: "0.5rem" }}>🚜 {t('my_products.title', 'My Registered Harvests')}</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>{t('my_products.subtitle', 'List of all product batches you have registered on the blockchain.')}</p>

        {loading ? (
          <p>Loading your products...</p>
        ) : products.length === 0 ? (
          <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🌾</div>
            <h3>{t('my_products.empty_title', 'No products registered yet.')}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{t('my_products.empty_desc', 'Go to the Dashboard to register your first harvest.')}</p>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.href = "/dashboard"}
            >
              {t('my_products.go_to_dashboard', 'Go to Dashboard')}
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
            {products.map((product) => (
              <div key={product._id} className="card" style={{ position: 'relative' }}>
                <div style={{ 
                  position: 'absolute', 
                  top: '1rem', 
                  right: '1rem', 
                  fontSize: '0.7rem', 
                  fontWeight: 800, 
                  color: 'var(--primary)',
                  letterSpacing: '0.05em'
                }}>
                    {product.batchId}
                </div>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>{product.productName}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>📍 Current:</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{product.location.lat.toFixed(2)}, {product.location.lng.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>📅 Registered:</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{new Date(product.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <StatusBadge status={product.status} verified={true} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stage: {product.currentStage}</span>
                    </div>
                </div>
                <button 
                    className="btn btn-secondary"
                    onClick={() => window.location.href = `/trace/${product.batchId}`}
                    style={{ marginTop: '1.5rem', width: '100%' }}
                >
                    View Full Journey
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default MyProducts;
