import React from 'react';
import { Exam, ExamStatus } from '../types';

interface ExamDetailProps {
  exam: Exam;
  onBack: () => void;
  onNotesChange: (examId: number, notes: string) => void;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="bg-slate-50 p-4 rounded-lg text-center sm:text-left">
        <div className="text-sm text-slate-500">{label}</div>
        <div className="text-lg font-bold text-slate-700">{value}</div>
    </div>
);


export const ExamDetail: React.FC<ExamDetailProps> = ({ exam, onBack, onNotesChange }) => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200 animate-fade-in">
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
        aria-label="Torna al libretto"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H15a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Torna al Libretto
      </button>

      <div className="pb-4 border-b border-slate-200 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">{exam.nome}</h1>
        <p className="text-md text-slate-500 font-mono mt-1">{exam.settore} - {exam.codice}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <DetailItem 
            label="Stato"
            value={
                <span className={`px-2 py-1 text-sm font-semibold rounded-full ${
                    exam.stato === ExamStatus.COMPLETED ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                    {exam.stato}
                </span>
            }
        />
        <DetailItem label="Voto" value={exam.voto ?? '–'} />
        <DetailItem label="CFU" value={exam.cfu} />
        <DetailItem label="Anno" value={exam.anno} />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-4 text-slate-800">Note Personali</h2>
        <textarea
          value={exam.notes}
          onChange={(e) => onNotesChange(exam.id, e.target.value)}
          placeholder="Aggiungi qui le tue note, appunti, date importanti..."
          className="w-full h-48 p-4 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition shadow-sm resize-y"
          aria-label={`Note per ${exam.nome}`}
        />
      </div>
    </div>
  );
};
