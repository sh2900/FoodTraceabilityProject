import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import { useTranslation } from 'react-i18next';

const ProductTimeline = ({ history }) => {
  const { t } = useTranslation();
  const [expandedHash, setExpandedHash] = useState(null);

  if (!history || history.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-state-icon">📄</span>
        <h4>{t('timeline.no_data', 'No journey data available')}</h4>
        <p>{t('timeline.not_started', 'This product has not yet started its journey through the supply chain.')}</p>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ padding: '1rem 0' }}>
      <style>{`
        @keyframes pulse-red {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .pulse-critical {
          animation: pulse-red 2s infinite;
        }
      `}</style>

      <div className="section-header">
        <h3 className="section-title">📦 {t('timeline.title', 'Journey Timeline')}</h3>
        <p>{t('timeline.subtitle', 'End-to-end traceability records from the immutable ledger.')}</p>
      </div>

      <div style={{ position: 'relative', paddingLeft: '3.5rem' }}>
        {/* Vertical Line */}
        <div style={{ 
          position: 'absolute', 
          left: '1rem', 
          top: '1rem', 
          bottom: '1rem', 
          width: '4px', 
          background: 'linear-gradient(to bottom, var(--primary), var(--secondary), var(--accent))',
          borderRadius: '4px',
          opacity: 0.2
        }}></div>
        
        {history.map((step, idx) => {
          const isWarning = step.status?.toLowerCase() === 'warning';
          const isCritical = step.status?.toLowerCase() === 'critical';
          const isExpanded = expandedHash === step.blockchainHash;
          
          return (
            <div key={idx} style={{ position: 'relative', marginBottom: '3rem' }}>
              {/* Timeline Node */}
              <div 
                className={isCritical ? 'pulse-critical' : ''}
                style={{ 
                position: 'absolute', 
                left: '-3rem', 
                top: '0.5rem', 
                width: '1.75rem', 
                height: '1.75rem', 
                borderRadius: '50%', 
                background: isCritical ? 'var(--critical)' : isWarning ? 'var(--warning)' : 'var(--primary)',
                border: '4px solid var(--bg-app)',
                boxShadow: 'var(--shadow-sm)',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.7rem',
                fontWeight: 800
              }}>
                {isCritical ? '!' : idx + 1}
              </div>
              
              <div className={`card ${isCritical ? 'card-premium' : ''}`} style={{ 
                borderLeft: isCritical ? '5px solid var(--critical)' : isWarning ? '5px solid var(--warning)' : '1px solid var(--border)',
                background: isCritical ? 'rgba(239, 68, 68, 0.03)' : 'var(--bg-surface)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h4 style={{ textTransform: 'capitalize', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {step.stage} {t('timeline.stage', 'Stage')}
                      {isCritical && <span style={{ color: 'var(--critical)', fontSize: '0.7rem', fontWeight: 800, background: 'rgba(239, 68, 68, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>{t('timeline.alert_triggered', 'ALERT TRIGGERED')}</span>}
                      <StatusBadge status={step.status} verified={!!step.blockchainHash} />
                    </h4>
                    <p style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                      🕒 {new Date(step.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{ padding: '0.625rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', textAlign: 'center', minWidth: '70px' }}>
                      <div className="label" style={{ margin: 0, fontSize: '0.6rem' }}>{t('timeline.temp', 'Temp')}</div>
                      <div style={{ fontWeight: 800, color: isCritical ? 'var(--critical)' : isWarning ? 'var(--warning)' : 'var(--primary)', fontSize: '1.1rem' }}>{step.temperature}°C</div>
                    </div>
                    <div style={{ padding: '0.625rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', textAlign: 'center', minWidth: '70px' }}>
                      <div className="label" style={{ margin: 0, fontSize: '0.6rem' }}>{t('timeline.humidity', 'Humidity')}</div>
                      <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{step.humidity}%</div>
                    </div>
                  </div>
                </div>

                <div className="divider" style={{ margin: '1.25rem 0' }}></div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.9rem' }}>
                    <span style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>📍</span>
                    <span style={{ fontWeight: 600 }}>
                      {typeof step.location === 'object' ? `${step.location.lat.toFixed(4)}, ${step.location.lng.toFixed(4)}` : step.location}
                    </span>
                  </div>
                  
                  {step.actor && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {t('timeline.authorized_actor', 'Authorized Actor')}: <span style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>{step.actor.username || t('timeline.system', 'System')}</span>
                    </div>
                  )}
                </div>

                {step.blockchainHash && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <div 
                      onClick={() => setExpandedHash(isExpanded ? null : step.blockchainHash)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem', 
                        background: 'var(--bg-app)', 
                        borderRadius: 'var(--radius-md)', 
                        border: isExpanded ? '1px solid var(--secondary)' : '1px solid var(--border)',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span>🔗</span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {t('timeline.blockchain_record', 'Blockchain Ledger Record')}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{isExpanded ? '▲' : '▼'}</span>
                    </div>

                    {isExpanded && (
                      <div style={{ 
                        marginTop: '0.5rem', 
                        padding: '1rem', 
                        background: 'var(--bg-app)', 
                        borderRadius: 'var(--radius-md)', 
                        border: '1px solid var(--border)',
                        animation: 'fadeIn 0.2s ease-out'
                      }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                          <div>
                            <div className="label" style={{ fontSize: '0.6rem' }}>{t('timeline.tx_hash', 'Tx Hash')}</div>
                            <code style={{ fontSize: '0.65rem', wordBreak: 'break-all', color: 'var(--text-primary)' }}>{step.blockchainHash}</code>
                          </div>
                          <div>
                            <div className="label" style={{ fontSize: '0.65rem' }}>{t('timeline.verification_status', 'Verification Status')}</div>
                            <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.75rem' }}>✅ {t('timeline.fully_validated', 'FULLY VALIDATED')}</div>
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{t('timeline.method', 'Method')}: <strong style={{ color: 'var(--text-secondary)' }}>ECDSA-Keccak256</strong></div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{t('timeline.protocol', 'Protocol')}: <strong style={{ color: 'var(--text-secondary)' }}>EVM Legacy</strong></div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{t('timeline.network', 'Network')}: <strong style={{ color: 'var(--text-secondary)' }}>Mainnet Simulator</strong></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductTimeline;
