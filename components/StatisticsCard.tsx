
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
  <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-lg text-center">
    <span className="text-sm text-slate-500 font-medium">{label}</span>
    <span className={`${large ? 'text-3xl' : 'text-xl'} font-bold text-slate-700`}>{value}</span>
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
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-2xl font-bold mb-4 text-slate-800">Il Tuo Riepilogo</h2>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-sky-600">Progresso CFU</span>
          <span className="text-sm font-bold text-slate-600">{completedCFU} / {totalCFU} CFU</span>
        </div>
        <ProgressBar value={progress} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatItem label="Progresso" value={`${Math.round(progress)}%`} large />
        <StatItem label="CFU Acquisiti" value={completedCFU} />
        <StatItem label="Media Aritmetica" value={arithmeticMean.toFixed(2)} />
        <StatItem label="Media Ponderata" value={weightedMean.toFixed(2)} />
      </div>
    </div>
  );
};
