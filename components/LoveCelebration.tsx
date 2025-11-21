
import React, { useEffect, useState } from 'react';

interface LoveCelebrationProps {
  onClose: () => void;
}

export const LoveCelebration: React.FC<LoveCelebrationProps> = ({ onClose }) => {
  const [phase, setPhase] = useState<'init' | 'blast' | 'settle'>('init');

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase('blast'), 100);
    const timer2 = setTimeout(() => setPhase('settle'), 800);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black" onClick={onClose}>
      {/* Background: Deep Space / Tech */}
      <div className="absolute inset-0 bg-slate-950">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-slate-950 to-slate-950"></div>
         <div className="absolute inset-0 bg-[linear-gradient(rgba(220,38,38,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.03)_1px,transparent_1px)] bg-[size:60px_60px] opacity-50"></div>
      </div>

      {/* Flash Bang */}
      <div className={`absolute inset-0 bg-white transition-opacity duration-1000 pointer-events-none ${phase === 'blast' ? 'opacity-20' : 'opacity-0'}`}></div>

      {/* Main Container */}
      <div className="relative w-full h-full flex flex-col items-center justify-center pointer-events-none">
        
        {/* Shockwaves */}
        <div className="absolute flex items-center justify-center">
             <div className={`rounded-full border-[4px] border-red-500/30 transition-all duration-1000 ease-out ${
                 phase === 'init' ? 'w-0 h-0 opacity-100' : 'w-[150vw] h-[150vw] opacity-0 border-[0px]'
             }`}></div>
        </div>

        {/* Reactor Heart BG */}
        <div className={`absolute z-0 transition-all duration-1000 ease-out ${
            phase === 'blast' ? 'scale-125 opacity-20' : 'scale-100 opacity-10'
        }`}>
             <svg viewBox="0 0 100 100" className="w-[80vmin] h-[80vmin] animate-pulse text-red-600 fill-current filter blur-xl">
                <path d="M50 90 C10 60 0 35 25 15 C40 5 50 25 50 25 C50 25 60 5 75 15 C100 35 90 60 50 90 Z" />
             </svg>
        </div>

        {/* TEXT CONTENT */}
        <div className={`relative z-10 flex flex-col items-center justify-center transition-all duration-1000 transform ${
            phase === 'settle' ? 'scale-100 opacity-100 translate-y-0' : 'scale-50 opacity-0 translate-y-10'
        }`}>
            
            {/* TOP: TI AMO */}
            <div className="text-center mb-[-2rem] sm:mb-[-4rem] z-20">
                <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold text-white font-mono tracking-[0.15em] drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
                    TI AMO
                </h1>
            </div>
            
            {/* MIDDLE: 3000 */}
            <div className="text-center z-10 mix-blend-screen">
                <span className="block text-[12rem] sm:text-[18rem] md:text-[24rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-red-200 to-red-600 drop-shadow-[0_0_60px_rgba(220,38,38,0.8)] filter brightness-110">
                    3000
                </span>
            </div>

            {/* BOTTOM: PATATINA MIA */}
            <div className="text-center mt-[-2rem] sm:mt-[-4rem] z-20 flex flex-col gap-0">
                <span className="text-4xl sm:text-7xl md:text-8xl font-black text-white tracking-widest uppercase drop-shadow-md">
                    PATATINA
                </span>
                <span className="text-5xl sm:text-8xl md:text-9xl font-black text-red-500 tracking-[0.2em] uppercase drop-shadow-[0_0_25px_rgba(220,38,38,1)] animate-pulse">
                    MIA
                </span>
            </div>

        </div>

        {/* Footer Close Hint */}
        <div className={`absolute bottom-8 pointer-events-auto transition-opacity duration-1000 delay-1000 ${phase === 'settle' ? 'opacity-100' : 'opacity-0'}`}>
            <button 
                onClick={onClose}
                className="px-6 py-2 bg-black/50 hover:bg-red-900/30 border border-red-900/50 hover:border-red-500 text-red-400 hover:text-white rounded-full text-xs font-mono tracking-[0.2em] transition-all backdrop-blur-md"
            >
                CHIUDI TRASMISSIONE
            </button>
        </div>

      </div>
    </div>
  );
};
