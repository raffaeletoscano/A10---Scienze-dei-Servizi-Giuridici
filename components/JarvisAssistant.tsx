
import React, { useState, useRef, useEffect } from 'react';
import { ArcReactor } from './icons/ArcReactor';
import { askJarvis } from '../services/ai';
import { Exam } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

interface JarvisAssistantProps {
  exams: Exam[];
  userName?: string;
}

export const JarvisAssistant: React.FC<JarvisAssistantProps> = ({ exams, userName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 'init', 
      sender: 'ai', 
      text: "Sistemi online. J.A.R.V.I.S. a tua disposizione. Analisi carriera effettuata. Come posso assisterti oggi?" 
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Welcome Balloon Logic
  useEffect(() => {
      if (userName && !isOpen) {
          setShowWelcome(true);
          const timer = setTimeout(() => {
              setShowWelcome(false);
          }, 5000); // 5 secondi
          return () => clearTimeout(timer);
      }
  }, [userName]);

  // Hide welcome if opened
  useEffect(() => {
      if (isOpen) setShowWelcome(false);
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const responseText = await askJarvis(input, exams);
    
    const aiMsg: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text: responseText || "Errore di comunicazione." };
    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      
      {/* WELCOME BALLOON */}
      {showWelcome && (
        <div className="mb-4 mr-2 animate-fade-in origin-bottom-right">
            <div className="bg-slate-900/90 backdrop-blur-md border border-cyan-500/60 text-cyan-100 px-4 py-3 rounded-xl rounded-br-none shadow-[0_0_20px_rgba(6,182,212,0.3)] relative max-w-[200px]">
                <div className="text-xs font-mono text-cyan-400 mb-1 tracking-widest">SYSTEM MESSAGE</div>
                <p className="font-bold text-sm">Ciao {userName}.</p>
                
                {/* Triangle Pointer */}
                <div className="absolute -bottom-2 right-0 w-4 h-4 bg-slate-900/90 border-b border-r border-cyan-500/60 transform rotate-45 translate-y-[-50%] translate-x-[-50%]"></div>
            </div>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="mb-6 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/50 rounded-xl shadow-[0_0_50px_rgba(6,182,212,0.4)] overflow-hidden flex flex-col transition-all animate-fade-in h-[500px] relative iron-flare">
          {/* Decorative HUD lines */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400 rounded-tl-md"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400 rounded-tr-md"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400 rounded-bl-md"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400 rounded-br-md"></div>

          {/* Header */}
          <div className="bg-cyan-950/50 p-3 border-b border-cyan-500/30 flex justify-between items-center z-10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
              <span className="text-cyan-400 font-mono text-xs tracking-[0.2em] font-bold">J.A.R.V.I.S. PROTOCOL</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-cyan-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoNiLCAxODIsIDIxMiwgMC4wNSkiLz48L3N2Zz4=')]">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-lg text-sm leading-relaxed border backdrop-blur-sm ${
                  msg.sender === 'user' 
                    ? 'bg-cyan-600/20 text-white rounded-tr-none border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.1)]' 
                    : 'bg-slate-800/80 text-cyan-100 rounded-tl-none border-slate-600 shadow-sm'
                }`}>
                  {msg.sender === 'ai' && <div className="text-[10px] text-cyan-400 font-mono mb-1 opacity-80 tracking-wider">AI SYSTEM RESPONSE</div>}
                  <div className="whitespace-pre-wrap markdown-body">{msg.text}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-800/50 p-3 rounded-lg rounded-tl-none border border-cyan-500/30 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce shadow-[0_0_5px_rgba(34,211,238,0.8)]"></span>
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce shadow-[0_0_5px_rgba(34,211,238,0.8)]" style={{animationDelay: '0.1s'}}></span>
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce shadow-[0_0_5px_rgba(34,211,238,0.8)]" style={{animationDelay: '0.2s'}}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-slate-900/80 border-t border-cyan-500/30 backdrop-blur-md">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ordini vocali (testo)..."
                className="flex-1 bg-slate-950 text-cyan-50 text-sm rounded-md border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none px-3 py-2 placeholder-slate-600 font-mono"
                autoFocus
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(6,182,212,0.4)] hover:shadow-[0_0_20px_rgba(6,182,212,0.6)]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BIG JARVIS BUTTON (Iron Man Interface Style) */}
      <div className="relative group flex items-center justify-center w-24 h-24">
         
         {/* External Glow Pulse */}
         <div className={`absolute inset-0 bg-cyan-500 rounded-full blur-xl transition-opacity duration-1000 ${isOpen ? 'opacity-0' : 'opacity-10 group-hover:opacity-30 animate-pulse'}`}></div>

         <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-20 h-20 flex items-center justify-center rounded-full focus:outline-none transition-transform duration-300 hover:scale-105 active:scale-95"
          aria-label="Attiva Jarvis"
        >
            {/* Layer 1: Outer Spinning Ring (Dashed) */}
            <div className={`absolute inset-0 rounded-full border-[2px] border-dashed border-cyan-800/80 transition-all duration-700 ${isOpen ? 'opacity-0 scale-50' : 'animate-[spin_10s_linear_infinite]'}`}></div>
            
            {/* Layer 2: Middle Tech Ring (Counter Spin) */}
            <div className={`absolute inset-1 rounded-full border border-cyan-500/40 transition-all duration-700 ${isOpen ? 'opacity-0 scale-50' : 'animate-[spin_15s_linear_infinite_reverse]'}`}
                 style={{ borderTopColor: 'transparent', borderBottomColor: 'transparent' }}>
            </div>

            {/* Layer 3: Main Container Background */}
            <div className={`absolute inset-2 rounded-full bg-slate-900 shadow-[0_0_20px_rgba(6,182,212,0.4)] border-2 border-cyan-400/80 overflow-hidden flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-slate-900 border-red-500/60 shadow-[0_0_30px_rgba(239,68,68,0.4)]' : 'group-hover:shadow-[0_0_30px_rgba(6,182,212,0.8)] group-hover:border-cyan-300'}`}>
                
                {/* Inner Details */}
                {isOpen ? (
                   // Close Icon
                   <svg className="w-8 h-8 text-red-400 animate-in fade-in zoom-in duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                   </svg>
                ) : (
                   // Jarvis Face
                   <div className="flex flex-col items-center justify-center w-full h-full relative">
                       {/* Tech Grid Background */}
                       <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-400 via-transparent to-transparent"></div>
                       
                       <ArcReactor className="w-8 h-8 text-cyan-300 drop-shadow-[0_0_10px_rgba(103,232,249,1)] mb-0.5" />
                       <span className="text-[9px] font-extrabold text-cyan-100 tracking-widest font-mono drop-shadow-md z-10">J.A.R.V.I.S.</span>
                       
                       {/* Active Scan Line */}
                       <div className="absolute w-full h-[1px] bg-cyan-400/50 top-1/2 shadow-[0_0_10px_#22d3ee] animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                   </div>
                )}
            </div>

            {/* Notification Badge */}
            {!isOpen && (
               <span className="absolute top-1 right-1 flex h-3 w-3 z-20">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500 border border-cyan-200"></span>
               </span>
            )}
        </button>
      </div>
    </div>
  );
};
