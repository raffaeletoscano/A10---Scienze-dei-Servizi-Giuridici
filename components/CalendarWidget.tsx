
import React, { useState, useMemo } from 'react';
import { CalendarEvent } from '../types';

interface CalendarWidgetProps {
  events: CalendarEvent[];
  onAddEvent?: (date: Date) => void;
  onExpand?: () => void;
}

const daysOfWeek = ['LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM'];
const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({ events, onAddEvent, onExpand }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Adjust for Mon start (0=Mon, 6=Sun)
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = (e: React.MouseEvent) => {
      e.stopPropagation(); // Previene l'espansione quando si cambia mese
      setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const nextMonth = (e: React.MouseEvent) => {
      e.stopPropagation(); // Previene l'espansione quando si cambia mese
      setCurrentDate(new Date(year, month + 1, 1));
  };
  
  const isToday = (d: number) => {
      const today = new Date();
      return d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const handleDateClick = (day: number, e: React.MouseEvent) => {
      const date = new Date(year, month, day);
      setSelectedDate(date);
  };

  // Filtra eventi per il mese corrente e il giorno selezionato
  const eventsInMonth = useMemo(() => {
      return events.filter(e => 
          e.date.getMonth() === month && 
          e.date.getFullYear() === year
      );
  }, [events, month, year]);

  const selectedDateEvents = useMemo(() => {
      if(!selectedDate) return [];
      return events.filter(e => 
        e.date.getDate() === selectedDate.getDate() &&
        e.date.getMonth() === selectedDate.getMonth() &&
        e.date.getFullYear() === selectedDate.getFullYear()
      );
  }, [events, selectedDate]);

  const getDotColor = (type: string) => {
      switch(type) {
          case 'exam': return 'bg-red-500';
          case 'study': return 'bg-cyan-500';
          case 'deadline': return 'bg-orange-500';
          default: return 'bg-slate-400';
      }
  };

  return (
    <div 
        onClick={onExpand}
        className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 relative overflow-hidden iron-flare h-full flex flex-col group cursor-pointer hover:shadow-xl transition-all duration-300"
    >
       {/* Decorative */}
       <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-50 dark:bg-cyan-900/20 rounded-bl-full opacity-50 pointer-events-none"></div>

       <div className="flex justify-between items-center mb-6 relative z-10">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <span className="w-1 h-5 bg-cyan-500 rounded-sm"></span>
            Calendario
          </h2>
          
          <div className="text-slate-300 dark:text-slate-600 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
          </div>
       </div>

       <div className="flex justify-between items-center mb-4" onClick={(e) => e.stopPropagation()}>
            <button onClick={prevMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400 hover:text-cyan-600 z-20">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{monthNames[month]} {year}</span>
            <button onClick={nextMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400 hover:text-cyan-600 z-20">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
       </div>

       {/* Calendar Grid */}
       <div className="grid grid-cols-7 gap-1 mb-2 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500">
          {daysOfWeek.map(d => <div key={d}>{d.substring(0,1)}</div>)}
       </div>
       <div className="grid grid-cols-7 gap-1 text-xs mb-4 relative z-10">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`}></div>)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = eventsInMonth.filter(e => e.date.getDate() === day);
              const hasEvents = dayEvents.length > 0;
              const isSel = selectedDate?.getDate() === day && selectedDate?.getMonth() === month;
              
              let dotColor = 'bg-slate-400';
              if (dayEvents.some(e => e.type === 'exam')) dotColor = 'bg-red-500';
              else if (dayEvents.some(e => e.type === 'deadline')) dotColor = 'bg-orange-500';
              else if (dayEvents.some(e => e.type === 'study')) dotColor = 'bg-cyan-500';

              return (
                  <div 
                    key={day} 
                    onClick={(e) => handleDateClick(day, e)}
                    className={`
                        h-7 w-7 rounded-full flex items-center justify-center transition-all duration-200 mx-auto relative
                        ${isToday(day) ? 'bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 font-bold border border-cyan-200 dark:border-cyan-700' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}
                        ${isSel ? 'ring-1 ring-cyan-400 ring-offset-1 bg-slate-50 dark:bg-slate-800 font-bold dark:ring-offset-slate-900' : ''}
                    `}
                  >
                      {day}
                      {hasEvents && (
                          <div className={`absolute -bottom-0.5 w-1 h-1 rounded-full ${dotColor}`}></div>
                      )}
                  </div>
              );
          })}
       </div>

       {/* Selected Day Events Mini List */}
       <div className="flex-1 overflow-y-auto custom-scrollbar border-t border-slate-100 dark:border-slate-800 pt-2">
            {selectedDateEvents.length === 0 ? (
                <div className="text-slate-300 dark:text-slate-600 text-xs text-center py-2">Clicca per espandere</div>
            ) : (
                <div className="space-y-1.5">
                    {selectedDateEvents.slice(0, 2).map(ev => (
                        <div key={ev.id} className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 flex items-center gap-2">
                             <div className={`w-1.5 h-1.5 rounded-full ${getDotColor(ev.type)}`}></div>
                             <div className="truncate">
                                 <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate w-24">{ev.title}</div>
                             </div>
                        </div>
                    ))}
                    {selectedDateEvents.length > 2 && (
                        <div className="text-[10px] text-center text-slate-400 italic">
                            + altri {selectedDateEvents.length - 2}
                        </div>
                    )}
                </div>
            )}
       </div>
       
       {/* Overlay Hint */}
       <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
           <div className="bg-cyan-600 text-white text-xs px-3 py-1 rounded-full shadow-lg font-bold animate-bounce">
               Apri Agenda
           </div>
       </div>
    </div>
  );
};
