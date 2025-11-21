
import React from 'react';

interface ProgressBarProps {
  value: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value }) => {
  const percentage = Math.round(value);
  return (
    <div className="w-full bg-slate-200 rounded-full h-3 shadow-inner overflow-hidden">
      <div
        className="bg-cyan-500 h-3 rounded-full transition-all duration-1000 ease-out relative"
        style={{ width: `${percentage}%`, boxShadow: '0 0 10px rgba(6, 182, 212, 0.7)' }}
      >
        <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>
      </div>
    </div>
  );
};
