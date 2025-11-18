import React, { useState, useMemo, useCallback } from 'react';
import { Exam, ExamStatus } from './types';
import { initialExams } from './constants';
import { StatisticsCard } from './components/StatisticsCard';
import { ExamTable } from './components/ExamTable';
import { ExamDetail } from './components/ExamDetail';

const App: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>(initialExams);
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);

  const handleGradeChange = useCallback((examId: number, grade: number) => {
    setExams((prevExams) =>
      prevExams.map((exam) =>
        exam.id === examId
          ? { ...exam, voto: grade, stato: ExamStatus.COMPLETED }
          : exam
      )
    );
  }, []);

  const handleNotesChange = useCallback((examId: number, notes: string) => {
    setExams(prevExams => 
        prevExams.map(exam => 
            exam.id === examId ? { ...exam, notes } : exam
        )
    );
  }, []);

  const handleExamSelect = useCallback((examId: number) => {
    setSelectedExamId(examId);
  }, []);

  const handleBackToList = useCallback(() => {
    setSelectedExamId(null);
  }, []);

  const stats = useMemo(() => {
    const totalCFU = exams.reduce((sum, exam) => sum + exam.cfu, 0);
    
    const completedExams = exams.filter(
      (exam) => exam.stato === ExamStatus.COMPLETED
    );

    const completedExamsWithGrade = completedExams.filter(
      (exam) => exam.voto !== null && exam.voto > 0
    );

    const completedCFU = completedExams.reduce(
      (sum, exam) => sum + exam.cfu,
      0
    );

    const progress = totalCFU > 0 ? (completedCFU / totalCFU) * 100 : 0;
    
    const arithmeticMean =
      completedExamsWithGrade.length > 0
        ? completedExamsWithGrade.reduce((sum, exam) => sum + exam.voto!, 0) / completedExamsWithGrade.length
        : 0;

    const weightedMeanNumerator = completedExamsWithGrade.reduce(
      (sum, exam) => sum + exam.voto! * exam.cfu,
      0
    );

    const weightedMeanDenominator = completedExamsWithGrade.reduce(
      (sum, exam) => sum + exam.cfu,
      0
    );
    
    const weightedMean =
      weightedMeanDenominator > 0
        ? weightedMeanNumerator / weightedMeanDenominator
        : 0;

    return {
      totalCFU,
      completedCFU,
      progress,
      arithmeticMean,
      weightedMean,
    };
  }, [exams]);
  
  const selectedExam = useMemo(() => 
    selectedExamId ? exams.find(e => e.id === selectedExamId) : undefined,
    [selectedExamId, exams]
  );

  let content;
  if (selectedExam) {
    content = (
      <ExamDetail 
        exam={selectedExam} 
        onBack={handleBackToList} 
        onNotesChange={handleNotesChange} 
      />
    );
  } else {
    content = (
      <>
        <StatisticsCard {...stats} />
        <ExamTable 
          exams={exams} 
          onGradeChange={handleGradeChange}
          onExamSelect={handleExamSelect} 
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-3">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sky-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 16c1.255 0 2.443-.29 3.5-.804V4.804zM14.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 0114.5 16c1.255 0 2.443-.29 3.5-.804v-10A7.968 7.968 0 0014.5 4z" />
                </svg>
                <h1 className="text-3xl font-bold leading-tight text-slate-900">
                    A10 - Scienze dei Servizi Giuridici
                </h1>
            </div>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {content}
          </div>
        </div>
      </main>
      <footer className="text-center py-6 text-sm text-slate-400">
        <p>Realizzato con React e Tailwind CSS.</p>
        <div className="mt-6 flex justify-center">
            <a 
                href="https://www.segrepass1.unina.it/Welcome.do" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-block p-4 bg-slate-800 rounded-xl transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 focus:ring-sky-500"
                aria-label="Accedi a Segrepass"
            >
                <svg width="140" height="42" viewBox="0 0 314 93" xmlns="http://www.w3.org/2000/svg" className="block">
                    <path d="M0 0 H250 C285 20, 285 73, 250 93 H0 Z" fill="#DC2626"/>
                    <path d="M250 0 H314 V93 H250 C285 73, 285 20, 250 0 Z" fill="#6B7280"/>
                    <text 
                        x="157" 
                        y="68" 
                        fontFamily="Inter, sans-serif" 
                        fontSize="55" 
                        fontWeight="900" 
                        fontStyle="italic" 
                        fill="white"
                        textAnchor="middle"
                        letterSpacing="-1"
                    >
                        SEGREPASS
                    </text>
                </svg>
            </a>
        </div>
      </footer>
    </div>
  );
};

export default App;