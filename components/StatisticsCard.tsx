
import React from 'react';
import { ProgressBar } from './ProgressBar';

interface StatisticsCardProps {
  totalCFU: number;
  completedCFU: number;
  progress: number;
  arithmeticMean: number;
  weightedMean: number;
}

const StatItem: React.FC<{ label: string; value: string | number; large?: boolean }> = ({ label, value, large = false }) => (
  <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 iron-flare group">
    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide mb-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{label}</span>
    <span className={`${large ? 'text-4xl text-cyan-600 dark:text-cyan-400 drop-shadow-sm' : 'text-xl text-slate-800 dark:text-white'} font-bold group-hover:scale-110 transition-transform duration-300`}>{value}</span>
  </div>
);

export const StatisticsCard: React.FC<StatisticsCardProps> = ({
  totalCFU,
  completedCFU,
  progress,
  arithmeticMean,
  weightedMean,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-100/50 dark:border-slate-800 relative overflow-hidden iron-flare transition-colors duration-300">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-cyan-50 dark:bg-cyan-900/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      
      <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white relative z-10 flex items-center gap-2">
        <span className="w-1 h-6 bg-cyan-500 rounded-sm"></span>
        Riepilogo Carriera
      </h2>
      
      <div className="mb-8 relative z-10">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider">Progresso CFU</span>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">
            {completedCFU} <span className="text-slate-400">/</span> {totalCFU}
          </span>
        </div>
        <ProgressBar value={progress} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 relative z-10">
        <StatItem label="Completamento" value={`${Math.round(progress)}%`} large />
        <StatItem label="CFU Acquisiti" value={completedCFU} />
        <StatItem label="Media Aritmetica" value={arithmeticMean.toFixed(2)} />
        <StatItem label="Media Ponderata" value={weightedMean.toFixed(2)} />
      </div>
    </div>
  );
};
