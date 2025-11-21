
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Exam, ExamStatus, SortConfig, SortableExamKeys } from '../types';
import { SortIcon } from './icons/SortIcon';

interface ExamTableProps {
  exams: Exam[];
  onExamSelect: (examId: number) => void;
  onGradeChange: (examId: number, grade: number | null) => void;
  onEditExam: (exam: Exam) => void;
  onAddExam: () => void;
}

export const ExamTable: React.FC<ExamTableProps> = ({ exams, onExamSelect, onGradeChange, onEditExam, onAddExam }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig | undefined>(undefined);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [gradeValue, setGradeValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleConfirmEditing = (navigateAway = false): boolean => {
    if (editingId === null) return true;

    const value = gradeValue.trim();
    
    // Caso stringa vuota -> Reset
    if (value === '') {
      onGradeChange(editingId, null);
      if (!navigateAway) {
        setEditingId(null);
        setError(null);
      }
      return true;
    }

    const grade = parseInt(value, 10);
    if (isNaN(grade) || String(grade) !== value) {
       setError('Voto non valido');
       return false;
    }

    // Caso 0 -> Reset (come se fosse vuoto)
    if (grade === 0) {
      onGradeChange(editingId, null);
      if (!navigateAway) {
        setEditingId(null);
        setError(null);
      }
      return true;
    }

    // Voti validi 18-30
    if (grade >= 18 && grade <= 30) {
      onGradeChange(editingId, grade);
      if (!navigateAway) {
        setEditingId(null);
        setError(null);
      }
      return true;
    } else {
      setError('Voto 18-30 o 0');
      return false;
    }
  };
  
  const handleStartEditing = (exam: Exam) => {
    if (exam.isIdoneita) return;

    if (editingId !== null && editingId !== exam.id) {
        const success = handleConfirmEditing();
        if (!success) return; 
    }
    setEditingId(exam.id);
    setGradeValue(exam.voto?.toString() ?? '');
    setError(null);
  };
  
  const handleCancelEditing = () => {
    setEditingId(null);
    setError(null);
  };

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleConfirmEditing();
    } else if (e.key === 'Escape') {
      handleCancelEditing();
    }
  };

  const handleRowClick = (examId: number) => {
    if (editingId !== null && editingId !== examId) {
      const success = handleConfirmEditing(true);
      if (!success) {
        return;
      }
    }
    onExamSelect(examId);
  }
  
  const handleBlur = () => {
    handleConfirmEditing();
  };

  const sortedExams = useMemo(() => {
    let sortableItems = [...exams];
    if (sortConfig !== undefined) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue === null || bValue === null) {
          if (aValue === null && bValue !== null) return 1;
          if (aValue !== null && bValue === null) return -1;
          return 0;
        }

        if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
            return (aValue === bValue) ? 0 : aValue ? -1 : 1;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [exams, sortConfig]);

  const requestSort = (key: SortableExamKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const headers: { key: SortableExamKeys; label: string; className?: string }[] = [
    { key: 'nome', label: 'Nome Insegnamento', className: 'w-2/5' },
    { key: 'cfu', label: 'CFU', className: 'text-center hidden sm:table-cell' },
    { key: 'anno', label: 'Anno', className: 'text-center hidden md:table-cell' },
    { key: 'stato', label: 'Stato' },
    { key: 'voto', label: 'Voto', className: 'text-center' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 shadow-lg border border-slate-200 dark:border-slate-800 mt-8 rounded-2xl overflow-hidden relative transition-colors duration-300">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="w-1 h-6 bg-cyan-500 rounded-sm"></span>
                Piano di Studi
            </h2>
            <div className="text-xs text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 hidden sm:block">
                {exams.length} CORSI
            </div>
          </div>

          <button 
            onClick={onAddExam}
            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md hover:shadow-lg transition-all iron-flare"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            <span className="hidden sm:inline">AGGIUNGI ESAME</span>
            <span className="sm:hidden">NUOVO</span>
          </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
          <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <tr>
              {headers.map((header) => (
                <th
                  key={header.key}
                  scope="col"
                  className={`px-6 py-4 cursor-pointer group hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${header.className || ''}`}
                  onClick={() => requestSort(header.key)}
                >
                  <div className="flex items-center justify-between">
                    {header.label}
                    <SortIcon sortConfig={sortConfig} columnKey={header.key} />
                  </div>
                </th>
              ))}
              <th className="px-6 py-4 text-center w-16">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {sortedExams.map((exam) => (
              <tr 
                key={exam.id} 
                className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 cursor-pointer hologram-row iron-flare group"
                onMouseDown={(e) => {
                  if (editingId !== null) e.preventDefault();
                }}
                onClick={() => handleRowClick(exam.id)}
              >
                <td className="px-6 py-4 font-semibold text-slate-800 dark:text-white">
                    <div className="flex flex-col">
                        <span>{exam.nome}</span>
                        <span className="text-[10px] text-slate-400 font-mono sm:hidden">{exam.cfu} CFU • {exam.anno}° ANNO</span>
                    </div>
                </td>
                <td className="px-6 py-4 text-center text-slate-500 dark:text-slate-400 hidden sm:table-cell">{exam.cfu}</td>
                <td className="px-6 py-4 text-center text-slate-500 dark:text-slate-400 hidden md:table-cell">{exam.anno}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    exam.stato === ExamStatus.COMPLETED 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800' 
                      : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                  }`}>
                    <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
                        exam.stato === ExamStatus.COMPLETED ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}></span>
                    {exam.stato}
                  </span>
                </td>
                <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                    {editingId === exam.id ? (
                         <div className="flex flex-col items-center relative z-20">
                         <input
                           ref={inputRef}
                           type="number"
                           min="0"
                           max="30"
                           value={gradeValue}
                           onChange={(e) => {
                             setGradeValue(e.target.value);
                             if (error) setError(null);
                           }}
                           onBlur={handleBlur}
                           onKeyDown={handleKeyDown}
                           placeholder="-"
                           className={`w-16 px-2 py-1 text-center text-lg font-bold bg-white dark:bg-slate-800 border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 ${error ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'}`}
                         />
                         {error && <div className="absolute top-full mt-1 w-32 text-xs text-white bg-red-500 p-1 rounded shadow-lg z-30">{error}</div>}
                       </div>
                    ) : (
                        <div
                            className={`font-bold text-lg p-1 rounded-lg transition-all duration-200 flex items-center justify-center h-10 w-16 mx-auto ${
                                exam.isIdoneita || (exam.voto && exam.voto >= 18)
                                ? 'text-emerald-600 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/30'
                                : 'text-slate-300 dark:text-slate-600 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-700 hover:shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                            }`}
                            onClick={() => handleStartEditing(exam)}
                            role={exam.isIdoneita ? undefined : "button"}
                            title={exam.isIdoneita ? "Idoneità acquisita" : "Clicca per voto rapido"}
                        >
                            {exam.isIdoneita ? 'ID' : (exam.voto ? (exam.lode ? '30L' : exam.voto) : '+')}
                        </div>
                    )}
                </td>
                {/* Pulsante Modifica Matita */}
                <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => onEditExam(exam)}
                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-full transition-all"
                        title="Modifica dettagli esame"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
