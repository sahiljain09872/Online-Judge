import React from 'react';
import { ChevronDown } from 'lucide-react';

const LanguageSelector = ({ value, onChange }) => {
  const languages = [
    { id: 'cpp', label: 'C++ (G++ 12)' },
    { id: 'python', label: 'Python 3.11' },
    { id: 'java', label: 'Java 17' },
  ];

  return (
    <div className="language-selector">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="lang-select"
      >
        {languages.map((lang) => (
          <option key={lang.id} value={lang.id}>
            {lang.label}
          </option>
        ))}
      </select>
      <ChevronDown size={16} className="lang-select-icon" />
    </div>
  );
};

export default LanguageSelector;
