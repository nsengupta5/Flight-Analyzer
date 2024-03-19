import React, { useState } from 'react';

function MultiSelect({ options }) {
  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleSelect = (event) => {
    const selectedValue = event.target.value;
    setSelectedOptions(prev => {
      if (prev.includes(selectedValue)) {
        return prev.filter(option => option !== selectedValue);
      } else {
        return [...prev, selectedValue];
      }
    });
  };

  return (
    <div className="flex flex-col">
      {options.map(option => (
        <label key={option.value} className="inline-flex items-center mt-3">
          <input
            type="checkbox"
            className="w-5 h-5 text-gray-600 form-checkbox"
            value={option.value}
            onChange={handleSelect}
            checked={selectedOptions.includes(option.value)}
          /><span className="ml-2 text-gray-700">{option.label}</span>
        </label>
      ))}
    </div>
  );
};

export default MultiSelect;
