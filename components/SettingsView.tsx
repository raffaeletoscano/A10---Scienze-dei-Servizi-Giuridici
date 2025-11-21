
import React from 'react';
import { ArcReactor } from './icons/ArcReactor';

interface SettingsViewProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onBack: () => void;
  onTriggerSecret: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ isDarkMode, toggleDarkMode, onBack, onTriggerSecret }) => {
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
       <button
        onClick={onBack}
        className="mb-6 inline-flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Torna alla Dashboard
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden iron-flare">
        <div className="p-8">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                Impostazioni Sistema
                <ArcReactor className="w-6 h-6 text-cyan-500" />
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">Configura l'interfaccia e le preferenze di A10 Systems.</p>

            <div className="space-y-6">
                {/* Toggle Dark Mode */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${isDarkMode ? 'bg-cyan-900 text-cyan-400' : 'bg-slate-200 text-slate-600'}`}>
                             {isDarkMode ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                             ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                             )}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white">Protocollo Iron Man (Dark Mode)</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Abilita il tema scuro ad alto contrasto stile HUD.</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={toggleDarkMode}
                        className={`relative w-14 h-8 rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 ${isDarkMode ? 'bg-cyan-600' : 'bg-slate-300'}`}
                    >
                        <span 
                            className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ease-in-out flex items-center justify-center ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}
                        >
                             {isDarkMode && <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>}
                        </span>
                    </button>
                </div>

                {/* Secret Love Mode Button */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer hover:bg-pink-50 dark:hover:bg-pink-900/10 group" onClick={onTriggerSecret}>
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:text-pink-500 group-hover:bg-pink-100 dark:group-hover:bg-pink-900/30 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">Protocollo "Rescue"</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Accesso Riservato.</p>
                        </div>
                    </div>
                    <button className="p-2 text-slate-300 hover:text-pink-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                </div>

                {/* Altre impostazioni placeholder */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 opacity-60 cursor-not-allowed">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white">Notifiche J.A.R.V.I.S.</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Avvisi sonori per scadenze ed esami.</p>
                        </div>
                    </div>
                    <div className="text-xs font-bold text-slate-400 uppercase">Coming Soon</div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
