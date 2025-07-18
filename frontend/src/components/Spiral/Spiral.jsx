// Spiral.jsx
import React from 'react';
import './Spiral.css';

const Spiral = () => {
  const spiralCount = 12;

  return (
    <div className="spiral-container">
      {Array.from({ length: spiralCount }).map((_, i) => (
        <svg key={i} className="spiral-hook" viewBox="0 0 20 40">
          <path
            d="M10,0 C5,10 5,30 10,40"
            stroke="#787878ff"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      ))}
    </div>
  );
};

export default Spiral;
