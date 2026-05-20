import React from 'react';
import VoiceInput from './VoiceInput';

const VoiceInputField = ({ 
  type = "text", 
  placeholder, 
  value, 
  onChange, 
  onVoiceText, 
  required, 
  style, 
  step, 
  className = "input-field" 
}) => {
  return (
    <div style={{ position: 'relative', width: style?.width || '100%', flex: style?.flex }}>
      <input 
        type={type}
        className={className} 
        placeholder={placeholder} 
        value={value} 
        onChange={onChange} 
        required={required}
        step={step}
        style={{ ...style, paddingRight: '2.5rem', width: '100%' }}
      />
      <div style={{ position: 'absolute', right: '0.25rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
        <VoiceInput onText={onVoiceText} />
      </div>
    </div>
  );
};

export default VoiceInputField;
