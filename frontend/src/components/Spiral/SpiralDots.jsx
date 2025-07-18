// SpiralDots.jsx
import React from 'react';
import './SpiralDots.css';

const SpiralDots = () => {
  const dotCount = 12;

  return (
    <>
    <div className="spiral-dots-container">
      {Array.from({ length: dotCount }).map((_, i) => (
        <div key={i} className="spiral-dot" />
      ))}
    </div>
    <div className="spiral-dots-container1">
      {Array.from({ length: dotCount }).map((_, i) => (
        <div key={i} className="spiral-dot" />
      ))}
    </div>
    </>
  );
};

export default SpiralDots;
