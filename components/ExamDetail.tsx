
import React, { useMemo, useState, useRef } from 'react';
import { Exam, ExamStatus, CalendarEvent } from '../types';

interface ExamDetailProps {
  exam: Exam;
  onBack: () => void;
  onNotesChange: (examId: number, notes: string) => void;
  events: CalendarEvent[];
  onAddEvent: (event: CalendarEvent) => void;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg text-center sm:text-left iron-flare border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</div>
        <div className="text-lg font-bold text-slate-800 dark:text-white truncate">{value}</div>
    </div>
);


export const ExamDetail: React.FC<ExamDetailProps> = ({ exam, onBack, onNotesChange, events, onAddEvent }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const dateInputRef = useRef<HTMLInputElement>(null);

  const examEvents = useMemo(() => {
      return events
        .filter(e => e.examId === exam.id)
        .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [events, exam.id]);

  const upcomingExam = useMemo(() => {
      const now = new Date();
      return examEvents.find(e => e.type === 'exam' && e.date >= now);
  }, [examEvents]);

  const handleBookExam = () => {
      if(!bookingDate) return;
      
      const dateObj = new Date(bookingDate);
      const newEvent: CalendarEvent = {
          id: Date.now().toString(),
          title: `Appello: ${exam.nome}`,
          date: dateObj,
          type: 'exam',
          examId: exam.id,
          description: 'Prenotazione confermata.'
      };
      
      onAddEvent(newEvent);
      setShowDatePicker(false);
      setBookingDate('');
  };

  const triggerDatePicker = () => {
    const input = dateInputRef.current;
    if (!input) return;

    input.focus();
    if ('showPicker' in HTMLInputElement.prototype) {
        try {
            input.showPicker();
        } catch (e) {
            console.warn("showPicker error:", e);
            input.click();
        }
    } else {
        input.click();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 animate-fade-in iron-flare">
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors iron-flare"
        aria-label="Torna al libretto"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H15a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Torna al Libretto
      </button>

      <div className="pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-2">{exam.nome}</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <DetailItem 
            label="Stato"
            value={
                <span className={`px-2 py-1 text-sm font-semibold rounded-full inline-block ${
                    exam.stato === ExamStatus.COMPLETED 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800' 
                    : 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'
                }`}>
                    {exam.stato}
                </span>
            }
        />
        <DetailItem label="Voto" value={
             exam.isIdoneita ? 
             <span className="text-emerald-600 dark:text-emerald-400">IDONEO</span> : 
             (exam.voto ? (exam.lode ? <span className="text-emerald-600 dark:text-emerald-400">30 e Lode</span> : <span className="text-emerald-600 dark:text-emerald-400">{exam.voto}</span>) : '–')
        } />
        <DetailItem label="CFU" value={exam.cfu} />
        
        <DetailItem label="Codice Esame" value={<span className="font-mono text-slate-600 dark:text-slate-300">{exam.codice}</span>} />
        <DetailItem label="Settore (SSD)" value={<span className="font-mono text-slate-600 dark:text-slate-300">{exam.settore}</span>} />
        <DetailItem label="Anno Corso" value={`${exam.anno}° Anno`} />
      </div>
      
      {/* SEZIONE PROTOCOLLO PRENOTAZIONE */}
      {exam.stato === ExamStatus.TODO && (
        <div className="mb-8 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 relative overflow-hidden">
            {/* Decor */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-100 dark:bg-cyan-900/30 rounded-bl-full opacity-30"></div>

            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                Protocollo Prenotazione
            </h2>

            {upcomingExam ? (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 flex items-start gap-3 animate-fade-in">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-full text-emerald-600 dark:text-emerald-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-emerald-800 dark:text-emerald-300">Esame Prenotato</h3>
                        <p className="text-sm text-emerald-600 dark:text-emerald-400">Appello fissato per il <span className="font-mono font-bold">{upcomingExam.date.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric'})}</span></p>
                    </div>
                </div>
            ) : (
                <div>
                    {!showDatePicker ? (
                         <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                             <div>
                                 <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">Nessuna prenotazione attiva rilevata.</p>
                                 <p className="text-xs text-slate-400 dark:text-slate-500">Hai già effettuato la prenotazione su portale d'ateneo?</p>
                             </div>
                             <button 
                                onClick={() => setShowDatePicker(true)}
                                className="whitespace-nowrap px-4 py-2 bg-cyan-600 text-white text-sm font-bold rounded-lg hover:bg-cyan-500 shadow-md transition-all"
                             >
                                 HO PRENOTATO L'ESAME
                             </button>
                         </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 border-2 border-cyan-500/20 p-6 rounded-xl shadow-lg animate-fade-in relative overflow-hidden iron-flare">
                            {/* Background Glow */}
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-cyan-50 dark:bg-cyan-900/20 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
                            
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 relative z-10 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></span>
                                Seleziona Data Appello
                            </label>
                            
                            <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                                <div className="relative flex-1 group">
                                    <style>{`
                                        input[type="date"]::-webkit-calendar-picker-indicator {
                                            display: none;
                                            -webkit-appearance: none;
                                        }
                                    `}</style>
                                    
                                    <input 
                                        ref={dateInputRef}
                                        type="date" 
                                        value={bookingDate}
                                        onChange={(e) => setBookingDate(e.target.value)}
                                        className="w-full bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-2 border-slate-200 dark:border-slate-600 rounded-lg pl-4 pr-12 py-2.5 focus:ring-4 focus:ring-cyan-100 dark:focus:ring-cyan-900/40 focus:border-cyan-500 outline-none font-mono font-medium transition-all shadow-sm hover:border-cyan-300 dark:hover:border-cyan-700"
                                        placeholder="gg/mm/aaaa"
                                        style={{ colorScheme: 'light dark' }}
                                    />
                                    
                                    <div className="absolute inset-y-0 right-0 w-12 flex items-center justify-center text-slate-400 dark:text-slate-500 border-l border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/50 rounded-r-lg pointer-events-none">
                                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                    </div>

                                    <button 
                                        type="button"
                                        onClick={triggerDatePicker}
                                        className="absolute inset-y-0 right-0 w-12 opacity-0 cursor-pointer z-10"
                                        title="Apri Calendario"
                                    >
                                        Apri
                                    </button>
                                </div>
                                
                                <div className="flex gap-2">
                                    <button 
                                        onClick={handleBookExam}
                                        disabled={!bookingDate}
                                        className="px-6 py-2.5 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-500 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                                        CONFERMA
                                    </button>
                                    <button 
                                        onClick={() => setShowDatePicker(false)}
                                        className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all"
                                    >
                                        ANNULLA
                                    </button>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 italic relative z-10 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Scrivi la data o clicca sull'icona calendario a destra.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
      )}
      
      <div>
        <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white flex items-center gap-2">
            <span className="w-1 h-6 bg-cyan-500 rounded-sm"></span>
            Note Personali
        </h2>
        <textarea
            className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 min-h-[150px] resize-y shadow-inner transition-all"
            placeholder="Aggiungi note su questo esame (libri, professori, domande frequenti)..."
            value={exam.notes || ''}
            onChange={(e) => onNotesChange(exam.id, e.target.value)}
        />
      </div>
    </div>
  );
};
