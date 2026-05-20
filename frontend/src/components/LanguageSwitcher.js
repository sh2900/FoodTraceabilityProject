import React from 'react';
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <select 
        value={i18n.language || 'en'} 
        onChange={(e) => changeLanguage(e.target.value)}
        className="input-field"
        style={{ padding: '0.5rem', height: 'auto', width: 'auto', cursor: 'pointer' }}
      >
        <option value="en">English</option>
        <option value="hi">हिंदी (Hindi)</option>
        <option value="te">తెలుగు (Telugu)</option>
      </select>
    </div>
  );
}

export default LanguageSwitcher;
