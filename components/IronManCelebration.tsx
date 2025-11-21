
import React, { useEffect, useState } from 'react';
import { ArcReactor } from './icons/ArcReactor';

interface CelebrationProps {
  examName: string;
  grade: number;
  cfu: number;
  onClose: () => void;
}

export const IronManCelebration: React.FC<CelebrationProps> = ({ examName, grade, cfu, onClose }) => {
  const [phase, setPhase] = useState<'init' | 'blast' | 'settle'>('init');
  const [displayedGrade, setDisplayedGrade] = useState(0);
  const [displayedCfu, setDisplayedCfu] = useState(0);

  useEffect(() => {
    // Sequenza temporale dell'animazione
    const timer1 = setTimeout(() => setPhase('blast'), 100);
    const timer2 = setTimeout(() => setPhase('settle'), 600);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Animazione numeri progressivi
  useEffect(() => {
    if (phase === 'settle') {
        // Incremento Voto
        const stepTime = 30;
        let currentGrade = 0;
        const gradeInterval = setInterval(() => {
            currentGrade += 1;
            setDisplayedGrade(currentGrade);
            if (currentGrade >= grade) clearInterval(gradeInterval);
        }, stepTime);

        // Incremento CFU
        let currentCfu = 0;
        const cfuInterval = setInterval(() => {
            currentCfu += 1;
            setDisplayedCfu(currentCfu);
            if (currentCfu >= cfu) clearInterval(cfuInterval);
        }, 50);

        return () => {
            clearInterval(gradeInterval);
            clearInterval(cfuInterval);
        };
    }
  }, [phase, grade, cfu]);

  const handleShare = async () => {
    const shareData = {
        title: 'Esame Superato!',
        text: `Ho appena superato ${examName} con ${grade} e ottenuto ${cfu} CFU! 🚀 #UniversityLife #IronManMode`,
    };

    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            // Fallback per desktop che non supportano share API
            await navigator.clipboard.writeText(shareData.text);
            alert("Testo copiato negli appunti!");
        }
    } catch (err) {
        console.error("Error sharing:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
      {/* 1. Background Overlay: Darker and more blurred to hide the table cleanly - NO ONCLICK */}
      <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md transition-opacity duration-300 animate-fade-in"></div>
      
      {/* 2. Grid Pattern Overlay for Tech feel */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>

      {/* 3. Flash Bang Effect (Full screen white flash on blast) */}
      <div className={`absolute inset-0 bg-white transition-opacity duration-500 pointer-events-none ${phase === 'blast' ? 'opacity-30' : 'opacity-0'}`}></div>

      {/* CONTAINER CENTRALE */}
      <div className="relative flex flex-col items-center justify-center w-full h-full pointer-events-none">
        
        {/* A. Shockwaves (Behind everything) */}
        <div className="absolute flex items-center justify-center pointer-events-none">
             {/* Primary Shockwave */}
             <div className={`rounded-full border-[6px] border-cyan-400/50 transition-all duration-700 ease-out ${
                 phase === 'init' ? 'w-0 h-0 opacity-100' : 'w-[800px] h-[800px] opacity-0 border-[0px]'
             }`}></div>
             {/* Secondary Shockwave (Delayed) */}
             <div className={`absolute rounded-full border-2 border-white/30 transition-all duration-1000 ease-out delay-100 ${
                 phase === 'init' ? 'w-0 h-0 opacity-100' : 'w-[600px] h-[600px] opacity-0'
             }`}></div>
        </div>

        {/* B. HUD Rotating Rings (Decorative) */}
        <div className={`absolute transition-all duration-700 top-1/3 -translate-y-1/2 ${phase === 'init' ? 'scale-50 opacity-0' : 'scale-100 opacity-100'}`}>
            {/* Outer Ring - Slow Spin */}
            <div className="w-[320px] h-[320px] rounded-full border border-cyan-800/40 border-dashed animate-[spin_10s_linear_infinite]"></div>
        </div>
        <div className={`absolute transition-all duration-700 delay-100 top-1/3 -translate-y-1/2 ${phase === 'init' ? 'scale-50 opacity-0' : 'scale-100 opacity-100'}`}>
             {/* Inner Ring - Reverse Spin */}
            <div className="w-[240px] h-[240px] rounded-full border border-cyan-500/20 border-dotted animate-[spin_8s_linear_infinite_reverse]"></div>
        </div>

        {/* C. Main Reactor (The Star) */}
        <div className={`relative z-20 mb-8 transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${
            phase === 'blast' ? 'scale-150 drop-shadow-[0_0_50px_rgba(34,211,238,1)]' : 'scale-100 drop-shadow-[0_0_30px_rgba(6,182,212,0.6)]'
        }`}>
            <div className="absolute inset-0 bg-cyan-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
            <ArcReactor className="w-24 h-24 sm:w-32 sm:h-32 text-white" />
        </div>

        {/* D. Report Card UI */}
        <div className={`relative z-30 flex flex-col items-center transition-all duration-700 transform w-full max-w-md px-6 ${
            phase === 'settle' ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
            <div className="text-cyan-200 font-mono text-xs tracking-[0.4em] mb-2">DATA UPLOADED</div>
            
            <h2 className="text-2xl sm:text-3xl font-black text-white text-center leading-tight mb-8 drop-shadow-lg uppercase">
                {examName}
            </h2>
            
            {/* PROGRESS BARS HUD */}
            <div className="w-full bg-slate-900/80 border border-cyan-500/30 p-6 rounded-xl backdrop-blur-sm shadow-[0_0_20px_rgba(6,182,212,0.2)] pointer-events-auto relative overflow-hidden">
                
                {/* Decorative Corner Lines */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400"></div>

                {/* VOTO BAR */}
                <div className="mb-6">
                    <div className="flex justify-between text-cyan-400 font-mono text-xs mb-1 font-bold tracking-wider">
                        <span>VOTO FINALE</span>
                        <span>{displayedGrade} / 30</span>
                    </div>
                    <div className="h-4 bg-slate-800 rounded-sm border border-slate-700 overflow-hidden relative">
                         {/* Tick Marks */}
                         <div className="absolute inset-0 flex justify-between px-1 z-10 opacity-20">
                            {[...Array(10)].map((_, i) => <div key={i} className="w-[1px] h-full bg-cyan-100"></div>)}
                         </div>
                        <div 
                            className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] transition-all duration-75 ease-linear relative"
                            style={{ width: `${(displayedGrade / 30) * 100}%` }}
                        >
                            <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-white animate-pulse"></div>
                        </div>
                    </div>
                </div>

                {/* CFU BAR */}
                <div className="mb-6">
                     <div className="flex justify-between text-cyan-400 font-mono text-xs mb-1 font-bold tracking-wider">
                        <span>CREDITI (CFU)</span>
                        <span>+{displayedCfu}</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-sm overflow-hidden">
                        <div 
                            className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] transition-all duration-75 ease-linear"
                            style={{ width: `${(displayedCfu / 12) * 100}%` }} /* Assumendo max 12 cfu per visualizzazione */
                        ></div>
                    </div>
                </div>

                {/* SHARE BUTTON */}
                <div className="flex justify-center mt-2">
                    <button 
                        onClick={handleShare}
                        className="group relative px-6 py-2 bg-cyan-900/40 hover:bg-cyan-800/60 text-cyan-100 font-bold font-mono uppercase tracking-widest text-sm border border-cyan-500/50 hover:border-cyan-400 rounded transition-all shadow-[0_0_10px_rgba(6,182,212,0.1)] hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] overflow-hidden"
                    >
                         {/* Hover Shine */}
                        <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform skew-x-[-20deg] group-hover:animate-[shimmer_1s_infinite]"></div>
                        
                        <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                            Condividi Risultato
                        </span>
                    </button>
                </div>

            </div>
            
            <div className="mt-8 pointer-events-auto">
                <button 
                    onClick={onClose}
                    className="px-6 py-2 bg-slate-800 text-slate-400 hover:text-white hover:bg-red-900/50 border border-transparent hover:border-red-500/50 rounded-lg text-xs font-mono tracking-widest transition-all duration-300"
                >
                    [ CHIUDI PROTOCOLLO ]
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};
