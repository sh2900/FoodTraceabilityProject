import React from 'react';
import { useTranslation } from 'react-i18next';

const StatusBadge = ({ status, verified }) => {
  const { t } = useTranslation();
  const getStatusConfig = (s) => {
    const statusLower = s?.toLowerCase();
    if (statusLower === 'warning') return { class: 'badge-warning', icon: '⚠️', label: t('badge.warning', 'Warning') };
    if (statusLower === 'critical') return { class: 'badge-critical', icon: '🚨', label: t('badge.critical', 'Critical') };
    return { class: 'badge-safe', icon: '✅', label: t('badge.safe', 'Safe') };
  };

  const config = getStatusConfig(status);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
      <span className={`badge ${config.class}`}>
        {config.icon} {config.label}
      </span>
      {verified && (
        <span className="verified-badge" style={{ cursor: 'help' }} title={t('badge.verified_title', 'Immutable ledger record: Data signed and stored on the blockchain.')}>
          🔗 {t('badge.verified', 'Verified')}
        </span>
      )}
    </div>
  );
};

export default StatusBadge;
