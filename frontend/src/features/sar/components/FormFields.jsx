import React from 'react';

/**
 * Reusable form field building blocks
 */

export const FormField = ({ id, label, required, children }) => (
  <div className="sar-form-field">
    <label className="sar-form-field__label" htmlFor={id}>
      {label}
      {required && <span className="sar-form-field__required">*</span>}
    </label>
    {children}
  </div>
);

export const TextInput = ({ id, value, onChange, placeholder, disabled, type = 'text', maxLength }) => (
  <input
    id={id}
    type={type}
    className="sar-form-field__input"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    disabled={disabled}
    maxLength={maxLength}
    autoComplete="off"
    spellCheck={false}
  />
);

export const TextArea = ({ id, value, onChange, placeholder, rows = 3 }) => (
  <textarea
    id={id}
    className="sar-form-field__textarea"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    rows={rows}
  />
);

export const CheckboxField = ({ id, label, checked, onChange }) => (
  <label className="sar-form-field__checkbox-label" htmlFor={id}>
    <input
      id={id}
      type="checkbox"
      className="sar-form-field__checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
    <span>{label}</span>
  </label>
);

export const SectionDivider = ({ title, icon }) => (
  <div className="sar-form-section-divider">
    {icon && <span className="sar-form-section-divider__icon">{icon}</span>}
    <span className="sar-form-section-divider__title">{title}</span>
    <div className="sar-form-section-divider__line" />
  </div>
);
