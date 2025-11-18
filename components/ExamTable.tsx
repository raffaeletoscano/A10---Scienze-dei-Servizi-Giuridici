import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Exam, ExamStatus, SortConfig, SortableExamKeys } from '../types';
import { SortIcon } from './icons/SortIcon';

interface EditableGradeProps {
  exam: Exam;
  onGradeChange: (examId: number, grade: number) => void;
}

const EditableGrade: React.FC<EditableGradeProps> = ({ exam, onGradeChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(exam.voto?.toString() ?? '');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEditing = () => {
    setValue(exam.voto?.toString() ?? '');
    setError(null);
    setIsEditing(true);
  };

  const handleConfirm = () => {
    const grade = parseInt(value, 10);

    if (isNaN(grade)) {
      setError(null);
      setIsEditing(false);
      return;
    }

    if (grade >= 18 && grade <= 30) {
      onGradeChange(exam.id, grade);
      setError(null);
      setIsEditing(false);
    } else {
      setError('Voto non valido (18-30)');
    }
  };

  const handleCancel = () => {
    setError(null);
    setIsEditing(false);
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex flex-col items-center">
        <input
          ref={inputRef}
          type="number"
          min="18"
          max="30"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
          }}
          onBlur={handleConfirm}
          onKeyDown={handleKeyDown}
          placeholder="--"
          aria-label={`Voto per ${exam.nome}`}
          className={`w-20 px-2 py-1 text-center bg-slate-50 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 ${error ? 'border-red-500' : 'border-slate-300'}`}
        />
        {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
      </div>
    );
  }

  return (
    <div
      className="font-bold text-lg cursor-pointer p-1 rounded-md hover:bg-slate-100 min-w-[5rem] h-8 flex items-center justify-center"
      onClick={handleStartEditing}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleStartEditing(); }}
      aria-label={`Modifica voto ${exam.voto ?? '-'} per ${exam.nome}`}
    >
      {exam.voto ?? '-'}
    </div>
  );
};


interface ExamTableProps {
  exams: Exam[];
  onGradeChange: (examId: number, grade: number) => void;
  onExamSelect: (examId: number) => void;
}

export const ExamTable: React.FC<ExamTableProps> = ({ exams, onGradeChange, onExamSelect }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig | undefined>(undefined);

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
    { key: 'cfu', label: 'CFU', className: 'text-center' },
    { key: 'anno', label: 'Anno', className: 'text-center' },
    { key: 'stato', label: 'Stato' },
    { key: 'voto', label: 'Voto', className: 'text-center' },
    { key: 'settore', label: 'Settore' },
  ];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200 mt-6">
      <h2 className="text-2xl font-bold mb-4 text-slate-800">Piano di Studi</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-xs text-slate-500 uppercase bg-slate-100">
            <tr>
              {headers.map((header) => (
                <th
                  key={header.key}
                  scope="col"
                  className={`px-4 py-3 cursor-pointer ${header.className || ''}`}
                  onClick={() => requestSort(header.key)}
                >
                  {header.label}
                  <SortIcon sortConfig={sortConfig} columnKey={header.key} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedExams.map((exam) => (
              <tr 
                key={exam.id} 
                className="bg-white border-b border-slate-200 hover:bg-slate-100 cursor-pointer"
                onClick={() => onExamSelect(exam.id)}
              >
                <td className="px-4 py-3 font-medium text-slate-900">{exam.nome}</td>
                <td className="px-4 py-3 text-center">{exam.cfu}</td>
                <td className="px-4 py-3 text-center">{exam.anno}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    exam.stato === ExamStatus.COMPLETED ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {exam.stato}
                  </span>
                </td>
                <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                   <EditableGrade key={exam.id} exam={exam} onGradeChange={onGradeChange} />
                </td>
                <td className="px-4 py-3 font-mono text-xs">{exam.settore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};