
import React, { useState, useMemo } from 'react';
import { CalendarEvent, Exam } from '../types';
import { ArcReactor } from './icons/ArcReactor';

interface CalendarFullViewProps {
  events: CalendarEvent[];
  onAddEvent: (event: CalendarEvent) => void;
  onUpdateEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onBack: () => void;
  exams: Exam[];
}

const daysOfWeek = ['LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM'];
const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

export const CalendarFullView: React.FC<CalendarFullViewProps> = ({ events, onAddEvent, onUpdateEvent, onDeleteEvent, onBack, exams }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventType, setNewEventType] = useState<'exam' | 'study' | 'deadline' | 'other'>('study');
  const [newEventNotes, setNewEventNotes] = useState('');

  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => {
    const day = new Date(y, m, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleDateClick = (day: number) => {
    const newDate = new Date(year, month, day);
    setSelectedDate(newDate);
    setExpandedEventId(null);

    const hasEvents = events.some(e => 
        e.date.getDate() === day && 
        e.date.getMonth() === month && 
        e.date.getFullYear() === year
    );

    if (!hasEvents) {
        setNewEventTitle('');
        setNewEventNotes('');
        setNewEventType('study');
        setIsModalOpen(true);
    }
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: newEventTitle,
      date: selectedDate,
      type: newEventType,
      description: 'Evento personalizzato',
      completed: false,
      notes: newEventNotes
    };

    onAddEvent(newEvent);
    setNewEventTitle('');
    setNewEventNotes('');
    setIsModalOpen(false);
  };

  const eventStyles = {
      exam: {
          bg: 'bg-red-50 dark:bg-red-900/20',
          text: 'text-red-800 dark:text-red-300',
          border: 'border-red-200 dark:border-red-800',
          dot: 'bg-red-500',
          hover: 'hover:bg-red-100 dark:hover:bg-red-900/30',
          label: 'Esame',
          icon: (
            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          )
      },
      study: {
          bg: 'bg-cyan-50 dark:bg-cyan-900/20',
          text: 'text-cyan-800 dark:text-cyan-300',
          border: 'border-cyan-200 dark:border-cyan-800',
          dot: 'bg-cyan-500',
          hover: 'hover:bg-cyan-100 dark:hover:bg-cyan-900/30',
          label: 'Studio',
          icon: (
            <svg className="w-4 h-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          )
      },
      deadline: {
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          text: 'text-orange-800 dark:text-orange-300',
          border: 'border-orange-200 dark:border-orange-800',
          dot: 'bg-orange-500',
          hover: 'hover:bg-orange-100 dark:hover:bg-orange-900/30',
          label: 'Scadenza',
          icon: (
            <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
      },
      other: {
          bg: 'bg-slate-50 dark:bg-slate-800',
          text: 'text-slate-700 dark:text-slate-300',
          border: 'border-slate-200 dark:border-slate-700',
          dot: 'bg-slate-400',
          hover: 'hover:bg-slate-100 dark:hover:bg-slate-700',
          label: 'Altro',
          icon: (
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
          )
      }
  };

  const upcomingExams = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return events
      .filter(e => e.type === 'exam' && e.date >= now)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [events]);

  const selectedDateEvents = useMemo(() => {
    return events.filter(e => 
      e.date.getDate() === selectedDate.getDate() &&
      e.date.getMonth() === selectedDate.getMonth() &&
      e.date.getFullYear() === selectedDate.getFullYear()
    );
  }, [events, selectedDate]);

  return (
    <div className="animate-fade-in space-y-6 pb-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
         <button 
            onClick={onBack}
            className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
         >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Torna alla Dashboard
         </button>
         <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <ArcReactor className="w-8 h-8 text-cyan-600" />
            AGENDA & PIANIFICAZIONE
         </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MAIN CALENDAR GRID */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 relative overflow-hidden iron-flare">
           <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white capitalize">
                  {monthNames[month]} <span className="text-cyan-600">{year}</span>
              </h2>
              <div className="flex gap-2">
                  <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg></button>
                  <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg></button>
              </div>
           </div>

           <div className="grid grid-cols-7 mb-4">
              {daysOfWeek.map(day => (
                  <div key={day} className="text-center text-sm font-bold text-slate-400 dark:text-slate-500 py-2">{day}</div>
              ))}
           </div>

           <div className="grid grid-cols-7 auto-rows-[100px] gap-1 border-t border-l border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
              {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="bg-white dark:bg-slate-900 border-b border-r border-slate-100 dark:border-slate-800"></div>
              ))}
              
              {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const currentDateObj = new Date(year, month, day);
                  const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === month;
                  const isToday = new Date().toDateString() === currentDateObj.toDateString();
                  
                  const daysEvents = events.filter(e => 
                    e.date.getDate() === day && 
                    e.date.getMonth() === month && 
                    e.date.getFullYear() === year
                  );

                  return (
                      <div 
                        key={day} 
                        onClick={() => handleDateClick(day)}
                        className={`bg-white dark:bg-slate-900 border-b border-r border-slate-100 dark:border-slate-800 p-2 cursor-pointer transition-all hover:bg-cyan-50 dark:hover:bg-slate-800 relative group
                            ${isSelected ? 'bg-cyan-50 dark:bg-cyan-900/10 ring-2 ring-inset ring-cyan-400' : ''}
                        `}
                      >
                          <div className="flex justify-between items-start">
                              <span className={`text-sm font-bold rounded-full w-7 h-7 flex items-center justify-center
                                  ${isToday ? 'bg-cyan-600 text-white' : 'text-slate-500 dark:text-slate-400'}
                              `}>{day}</span>
                          </div>
                          
                          <div className="mt-1 space-y-1 overflow-hidden max-h-[60px]">
                              {daysEvents.slice(0, 3).map(ev => {
                                  const style = eventStyles[ev.type] || eventStyles.other;
                                  return (
                                      <div key={ev.id} className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded truncate font-semibold border ${style.bg} ${style.text} ${style.border} ${ev.completed ? 'opacity-50 line-through' : ''}`}>
                                          {ev.completed && <svg className="w-2.5 h-2.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>}
                                          {ev.title}
                                      </div>
                                  );
                              })}
                              {daysEvents.length > 3 && (
                                  <div className="text-[9px] text-slate-400 dark:text-slate-600 text-center font-medium">+ {daysEvents.length - 3} altri</div>
                              )}
                          </div>
                          
                          <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="text-cyan-400 hover:text-cyan-600" title="Seleziona">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                              </div>
                          </div>
                      </div>
                  );
              })}
           </div>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-100 dark:bg-cyan-900/20 rounded-bl-full opacity-40 pointer-events-none"></div>
                
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2 flex justify-between items-center relative z-10">
                    <span>{selectedDate.getDate()} {monthNames[selectedDate.getMonth()]}</span>
                    <button 
                        onClick={() => {
                            setNewEventTitle('');
                            setNewEventNotes('');
                            setIsModalOpen(true);
                        }}
                        className="text-xs bg-cyan-600 text-white px-3 py-1.5 rounded-md hover:bg-cyan-500 shadow-sm font-bold flex items-center gap-1"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        EVENTO
                    </button>
                </h3>

                <div className="space-y-3 min-h-[150px] relative z-10">
                    {selectedDateEvents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-slate-400 dark:text-slate-600 cursor-pointer" onClick={() => setIsModalOpen(true)}>
                             <svg className="w-8 h-8 mb-2 opacity-20 hover:opacity-40 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                             <p className="text-sm italic text-center">Nessun impegno.<br/><span className="text-xs text-cyan-500 font-bold">Clicca per aggiungere</span></p>
                        </div>
                    ) : (
                        selectedDateEvents.map(ev => {
                            const style = eventStyles[ev.type] || eventStyles.other;
                            const isExpanded = expandedEventId === ev.id;

                            return (
                                <div 
                                    key={ev.id} 
                                    className={`rounded-lg border transition-all duration-200 overflow-hidden shadow-sm ${style.bg} ${style.border} ${ev.completed ? 'opacity-75' : ''}`}
                                >
                                    <div 
                                        className="p-3 flex items-start gap-3 cursor-pointer hover:bg-white/50 dark:hover:bg-black/20"
                                        onClick={() => setExpandedEventId(isExpanded ? null : ev.id)}
                                    >
                                        <div className="mt-1 flex-shrink-0">
                                            {style.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-bold truncate transition-all ${ev.completed ? 'text-slate-500 dark:text-slate-500 line-through' : style.text}`}>
                                                {ev.title}
                                            </p>
                                            <div className="flex justify-between items-center mt-0.5">
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide font-bold opacity-70">{style.label}</p>
                                                {isExpanded ? (
                                                     <svg className="w-3 h-3 text-slate-400 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                                                ) : (
                                                     <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="px-3 pb-3 pt-1 bg-white/50 dark:bg-black/10 border-t border-slate-200/60 dark:border-slate-700/50">
                                            <label className="flex items-center gap-2 cursor-pointer mb-3 select-none group p-2 rounded-md hover:bg-white/80 dark:hover:bg-black/20 transition-colors">
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${ev.completed ? 'bg-emerald-500 border-emerald-600' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 group-hover:border-cyan-400'}`}>
                                                    {ev.completed && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>}
                                                </div>
                                                <input 
                                                    type="checkbox" 
                                                    className="hidden"
                                                    checked={!!ev.completed}
                                                    onChange={(e) => onUpdateEvent({ ...ev, completed: e.target.checked })}
                                                />
                                                <span className={`text-xs font-bold ${ev.completed ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                                    {ev.completed ? 'Attività Completata' : 'Segna come completato'}
                                                </span>
                                            </label>

                                            <div className="mb-3">
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Note & Appunti</label>
                                                <textarea 
                                                    className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md p-2 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none resize-none min-h-[80px]"
                                                    placeholder="Aggiungi dettagli, progressi o appunti..."
                                                    value={ev.notes || ''}
                                                    onChange={(e) => onUpdateEvent({ ...ev, notes: e.target.value })}
                                                ></textarea>
                                            </div>

                                            <div className="flex justify-end border-t border-slate-200/50 dark:border-slate-700/50 pt-2">
                                                <button 
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); 
                                                        onDeleteEvent(ev.id);
                                                    }}
                                                    className="text-xs text-red-500 hover:text-white hover:bg-red-500 border border-red-200 dark:border-red-900 hover:border-red-500 flex items-center gap-1 px-3 py-1.5 rounded transition-all shadow-sm"
                                                >
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                                    Elimina
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 relative overflow-hidden iron-flare">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-full blur-2xl opacity-60 pointer-events-none"></div>
                 
                 <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-widest mb-4 relative z-10 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    Prossimi Appelli
                 </h3>

                 <div className="space-y-4 relative z-10">
                    {upcomingExams.length === 0 ? (
                        <div className="text-slate-400 text-sm text-center py-4 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800">
                            Nessun esame prenotato.
                        </div>
                    ) : (
                        upcomingExams.map(examEvent => (
                            <div key={examEvent.id} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3 rounded-lg shadow-sm flex items-center gap-3 hover:border-red-200 dark:hover:border-red-800 hover:shadow-md transition-all group">
                                <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded text-center min-w-[50px] border border-red-100 dark:border-red-900/50 group-hover:bg-red-100 dark:group-hover:bg-red-900/40 transition-colors">
                                    <div className="text-xs text-red-400 font-bold uppercase">{monthNames[examEvent.date.getMonth()].substring(0,3)}</div>
                                    <div className="text-lg font-bold text-red-600 dark:text-red-400">{examEvent.date.getDate()}</div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate" title={examEvent.title}>{examEvent.title.replace('Appello: ', '')}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                        Prenotato
                                    </div>
                                </div>
                                <button 
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteEvent(examEvent.id);
                                    }}
                                    className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-all"
                                    title="Rimuovi prenotazione"
                                >
                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>
                        ))
                    )}
                 </div>
            </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-700 iron-flare relative overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <span className="w-2 h-6 bg-cyan-500 rounded-full"></span>
                        Nuovo Evento
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700">
                    Data: <span className="font-bold text-slate-700 dark:text-slate-200">{selectedDate.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long'})}</span>
                </p>
                
                <form onSubmit={handleSaveEvent}>
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Titolo Attività</label>
                        <input 
                            type="text" 
                            className="w-full bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none font-medium"
                            placeholder="Es. Ripasso Diritto Privato"
                            value={newEventTitle}
                            onChange={e => setNewEventTitle(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Note (Opzionale)</label>
                        <textarea 
                            className="w-full bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none font-medium resize-none h-20"
                            placeholder="Aggiungi dettagli, orari, libri..."
                            value={newEventNotes}
                            onChange={e => setNewEventNotes(e.target.value)}
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Tipologia</label>
                        <div className="grid grid-cols-2 gap-2">
                             {[
                                 { id: 'exam', label: 'Esame', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-200 dark:hover:bg-red-900/50 ring-red-400' },
                                 { id: 'study', label: 'Studio', color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800 hover:bg-cyan-200 dark:hover:bg-cyan-900/50 ring-cyan-400' },
                                 { id: 'deadline', label: 'Scadenza', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800 hover:bg-orange-200 dark:hover:bg-orange-900/50 ring-orange-400' },
                                 { id: 'other', label: 'Altro', color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 ring-slate-400' }
                             ].map((type) => (
                                 <button
                                    key={type.id}
                                    type="button"
                                    onClick={() => setNewEventType(type.id as any)}
                                    className={`px-3 py-2 rounded-lg text-sm font-bold border transition-all ${
                                        newEventType === type.id 
                                        ? `${type.color} ring-2 ring-offset-1 scale-105 dark:ring-offset-slate-900` 
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                    }`}
                                 >
                                     {type.label}
                                 </button>
                             ))}
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors"
                        >
                            Annulla
                        </button>
                        <button 
                            type="submit" 
                            className="px-6 py-2 bg-cyan-600 text-white rounded-lg font-bold hover:bg-cyan-500 shadow-md hover:shadow-lg transition-all"
                        >
                            Salva Evento
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};
