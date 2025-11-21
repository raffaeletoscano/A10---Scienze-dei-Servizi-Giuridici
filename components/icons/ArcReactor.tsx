
import React from 'react';

export const ArcReactor: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    viewBox="0 0 100 100" 
    className={className} 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <filter id="reactor-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <linearGradient id="metal-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e2e8f0" />
        <stop offset="100%" stopColor="#94a3b8" />
      </linearGradient>
    </defs>
    
    {/* Anello Esterno */}
    <circle cx="50" cy="50" r="45" stroke="#334155" strokeWidth="6" fill="#0f172a" />
    <circle cx="50" cy="50" r="45" stroke="url(#metal-gradient)" strokeWidth="2" strokeOpacity="0.5" />
    
    {/* Triangolo Luminoso */}
    <path
      d="M50 82 L22 34 L78 34 Z"
      stroke="#06b6d4"
      strokeWidth="4"
      fill="none"
      filter="url(#reactor-glow)"
      strokeLinejoin="round"
    />
    
    {/* Nucleo Centrale */}
    <circle cx="50" cy="52" r="8" fill="#ecfeff" filter="url(#reactor-glow)" />
    <circle cx="50" cy="52" r="4" fill="#fff" />

    {/* Dettagli Tech */}
    <path d="M50 12 V25" stroke="#06b6d4" strokeWidth="2" opacity="0.6" />
    <path d="M16 70 L27 60" stroke="#06b6d4" strokeWidth="2" opacity="0.6" />
    <path d="M84 70 L73 60" stroke="#06b6d4" strokeWidth="2" opacity="0.6" />
  </svg>
);
