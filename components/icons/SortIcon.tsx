
import React from 'react';
import { SortConfig } from '../../types';

interface SortIconProps {
  sortConfig?: SortConfig;
  columnKey: string;
}

export const SortIcon: React.FC<SortIconProps> = ({ sortConfig, columnKey }) => {
  if (!sortConfig || sortConfig.key !== columnKey) {
    return (
      <svg className="w-4 h-4 text-slate-400 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
      </svg>
    );
  }
  if (sortConfig.direction === 'ascending') {
    return (
      <svg className="w-4 h-4 text-sky-500 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4 text-sky-500 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
    </svg>
  );
};
