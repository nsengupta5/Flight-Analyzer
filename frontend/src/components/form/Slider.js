import React, { useState } from 'react'

function Slider(props) {
  const { minVal, maxVal, value, onChange, className, label } = props;

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <input
        type="range"
        min={minVal}
        max={maxVal}
        value={value}
        onChange={onChange}
        label={label}
        className="w-full h-2 appearance-none cursor-pointer rounded-md bg-stone-200 dark:bg-stone-200"
      />
      <span className="text-lg font-medium">{label}</span>
    </div>
  )
}

export default Slider;
