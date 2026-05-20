import React from 'react';

const SummaryCard = ({ title, value, icon, trend, color }) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{title}</span>
        <div style={{ 
          fontSize: '1.25rem', 
          backgroundColor: `${color}15`, 
          color: color,
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
          <span style={{ color: trend.startsWith('+') ? 'var(--safe)' : 'var(--critical)', fontWeight: 600 }}>
            {trend}
          </span>
          <span style={{ color: 'var(--text-muted)' }}>since last month</span>
        </div>
      )}
    </div>
  );
};

export default SummaryCard;
