
import React from 'react';
import { SortConfig } from '../../types';

interface SortIconProps {
  sortConfig?: SortConfig;
  columnKey: string;
}

export const SortIcon: React.FC<SortIconProps> = ({ sortConfig, columnKey }) => {
  if (!sortConfig || sortConfig.key !== columnKey) {
    return (
      <svg className="w-4 h-4 text-slate-300 inline-block ml-1 transition-colors group-hover:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
      </svg>
    );
  }
  if (sortConfig.direction === 'ascending') {
    return (
      <svg className="w-4 h-4 text-cyan-600 inline-block ml-1 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7"></path>
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4 text-cyan-600 inline-block ml-1 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
    </svg>
  );
};
