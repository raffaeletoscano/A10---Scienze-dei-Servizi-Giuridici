
import React from 'react';

interface ProgressBarProps {
  value: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value }) => {
  const percentage = Math.round(value);
  return (
    <div className="w-full bg-slate-200 rounded-full h-2.5">
      <div
        className="bg-sky-500 h-2.5 rounded-full transition-all duration-500"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};
