
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Exam, ExamStatus, CalendarEvent, UserProfile } from './types';
import { initialExams } from './constants';
import { StatisticsCard } from './components/StatisticsCard';
import { ExamTable } from './components/ExamTable';
import { ExamDetail } from './components/ExamDetail';
import { CalendarFullView } from './components/CalendarFullView';
import { ArcReactor } from './components/icons/ArcReactor';
import { JarvisAssistant } from './components/JarvisAssistant';
import { IronManCelebration } from './components/IronManCelebration';
import { LoveCelebration } from './components/LoveCelebration';
import { ExamFormModal } from './components/ExamFormModal';
import { CalendarWidget } from './components/CalendarWidget';
import { ProfileView } from './components/ProfileView';
import { SettingsView } from './components/SettingsView';

// Import Firebase
import { auth, db, googleProvider } from './firebaseConfig';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

type ViewState = 'dashboard' | 'examDetail' | 'calendarFull' | 'profile' | 'settings';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<Exam[]>(initialExams);
  
  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>({
    firstName: 'Utente',
    lastName: 'Ospite',
    matricola: '',
    personalEmail: '',
    universityEmail: '',
    phoneNumber: '',
    photoURL: ''
  });

  // View State Management
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  
  // UI State
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
      const saved = localStorage.getItem('theme');
      return saved === 'dark';
  });

  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const [authDomainError, setAuthDomainError] = useState<string | null>(null);
  
  // Stati per la Modale di Modifica/Aggiunta
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [currentExamToEdit, setCurrentExamToEdit] = useState<Exam | undefined>(undefined);

  // Stato per la celebrazione
  const [celebrationData, setCelebrationData] = useState<{ name: string; grade: number; cfu: number } | null>(null);

  // Stato per la Love Mode (Secret)
  const [showLoveCelebration, setShowLoveCelebration] = useState(false);

  // Stato per gli eventi (Calendario)
  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: '1', title: 'Inizio Semestre', date: new Date(), type: 'other', description: 'Bentornato sir.', completed: false, notes: '' },
  ]);

  // Handle Click Outside per il menu utente
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Gestione cambio tema con persistenza
  const toggleTheme = () => {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  // 1. Gestione Autenticazione
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
          const names = (currentUser.displayName || "Utente Ospite").split(' ');
          setUserProfile(prev => ({
              ...prev,
              firstName: names[0],
              lastName: names.slice(1).join(' ') || '',
              personalEmail: currentUser.email || '',
              photoURL: currentUser.photoURL || ''
          }));
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Sincronizzazione Database in tempo reale
  useEffect(() => {
    if (!user) {
      setExams(initialExams); 
      return;
    }

    if (user.uid === 'guest-mode') {
        setExams(initialExams);
        return;
    }

    const userDocRef = doc(db, "users", user.uid);
    
    const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.exams) {
          setExams(data.exams);
        }
        if (data.profile) {
            setUserProfile(data.profile);
        }
      } else {
        setDoc(userDocRef, { exams: initialExams }, { merge: true });
      }
    }, (error) => {
      console.error("Errore sync DB:", error);
    });

    return () => unsubscribeSnapshot();
  }, [user]);

  const saveToFirestore = async (newExams: Exam[]) => {
    if (!user || user.uid === 'guest-mode') return;

    try {
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, { exams: newExams }, { merge: true });
    } catch (e) {
      console.error("Errore salvataggio:", e);
    }
  };
  
  const saveProfileToFirestore = async (newProfile: UserProfile) => {
      setUserProfile(newProfile);
      if (!user || user.uid === 'guest-mode') return;
      
      try {
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, { profile: newProfile }, { merge: true });
      } catch (e) {
        console.error("Errore salvataggio profilo:", e);
      }
  };

  const handleLogin = async () => {
    setAuthDomainError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Errore login:", error);
      if (error.code === 'auth/unauthorized-domain') {
        setAuthDomainError(window.location.hostname);
      }
    }
  };

  const handleGuestLogin = () => {
    // Immagine SVG generata inline per Iron Man
    const ironManSvg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FCD34D" />
          <stop offset="100%" stop-color="#F59E0B" />
        </linearGradient>
        <linearGradient id="red" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#EF4444" />
          <stop offset="100%" stop-color="#991B1B" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill="url(#red)" />
      <path d="M25,25 Q50,5 75,25 L75,80 Q50,95 25,80 Z" fill="#7F1D1D" />
      <path d="M30,35 Q50,20 70,35 L68,75 Q50,85 32,75 Z" fill="url(#gold)" stroke="#B45309" stroke-width="1" />
      <rect x="38" y="48" width="8" height="3" rx="1" fill="#22D3EE" style="filter: drop-shadow(0 0 2px #22D3EE);" />
      <rect x="54" y="48" width="8" height="3" rx="1" fill="#22D3EE" style="filter: drop-shadow(0 0 2px #22D3EE);" />
    </svg>`);
    
    const photoUrl = `data:image/svg+xml;charset=utf-8,${ironManSvg}`;

    const guestUser = {
        uid: 'guest-mode',
        displayName: 'Tony Stark',
        email: 'tony.stark300@shield.com',
        photoURL: photoUrl,
        isAnonymous: true,
    } as unknown as User;
    
    setUser(guestUser);
    
    setUserProfile({
        firstName: 'Tony',
        lastName: 'Stark',
        matricola: '12345679',
        universityEmail: 'tony.stark300@shield.com',
        personalEmail: 'tony.stark300@shield.com',
        phoneNumber: '23320',
        photoURL: photoUrl
    });

    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      if (user?.uid === 'guest-mode') {
          setUser(null);
      } else {
          await signOut(auth);
      }
      setSelectedExamId(null);
      setCurrentView('dashboard');
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error("Errore logout:", error);
    }
  };

  // --- GESTIONE MODAL ESAME (ADD/EDIT) ---
  const handleOpenAddExam = () => {
    setCurrentExamToEdit(undefined);
    setIsExamModalOpen(true);
  };

  const handleOpenEditExam = (exam: Exam) => {
    setCurrentExamToEdit(exam);
    setIsExamModalOpen(true);
  };

  const handleSaveExam = (savedExam: Exam) => {
    let updatedExams: Exam[];
    const existingIndex = exams.findIndex(e => e.id === savedExam.id);

    if (existingIndex >= 0) {
        const oldExam = exams[existingIndex];
        if (savedExam.voto && savedExam.voto >= 18) {
             if (!oldExam.voto || oldExam.voto < 18) {
                 setCelebrationData({
                     name: savedExam.nome,
                     grade: savedExam.voto,
                     cfu: savedExam.cfu
                 });
             }
        }
        updatedExams = [...exams];
        updatedExams[existingIndex] = savedExam;
    } else {
        updatedExams = [...exams, savedExam];
        if (savedExam.voto && savedExam.voto >= 18) {
            setCelebrationData({
                name: savedExam.nome,
                grade: savedExam.voto,
                cfu: savedExam.cfu
            });
        }
    }
    setExams(updatedExams);
    saveToFirestore(updatedExams);
  };

  // --- GESTIONE INLINE GRADE CHANGE ---
  const handleGradeChange = useCallback((examId: number, grade: number | null) => {
    const examIndex = exams.findIndex(e => e.id === examId);
    if (examIndex === -1) return;
    
    const currentExam = exams[examIndex];

    if (grade !== null && grade >= 18) {
        if (currentExam.voto === null || currentExam.voto < 18) {
            setCelebrationData({
              name: currentExam.nome,
              grade: grade,
              cfu: currentExam.cfu
            });
        }
    }

    const updatedExams = exams.map((exam) => {
      if (exam.id !== examId) return exam;
      
      if (grade !== null) {
        return { ...exam, voto: grade, lode: false, isIdoneita: false, stato: ExamStatus.COMPLETED };
      } else {
        return { ...exam, voto: null, lode: false, isIdoneita: false, stato: ExamStatus.TODO };
      }
    });
    
    setExams(updatedExams);
    saveToFirestore(updatedExams);
  }, [exams, user]);

  const handleNotesChange = useCallback((examId: number, notes: string) => {
    const updatedExams = exams.map(exam => 
      exam.id === examId ? { ...exam, notes } : exam
    );
    setExams(updatedExams);
    saveToFirestore(updatedExams);
  }, [exams, user]);

  // --- GESTIONE CALENDARIO ---
  const handleAddEvent = (newEvent: CalendarEvent) => {
      setEvents(prev => [...prev, newEvent]);
  };

  const handleUpdateEvent = (updatedEvent: CalendarEvent) => {
      setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
  };

  const handleDeleteEvent = useCallback((eventId: string) => {
      setEvents(prev => prev.filter(e => e.id !== eventId));
  }, []);

  const handleBackToDashboard = useCallback(() => {
    setSelectedExamId(null);
    setCurrentView('dashboard');
  }, []);

  const handleExamSelect = useCallback((examId: number) => {
    setSelectedExamId(examId);
    setCurrentView('examDetail');
  }, []);
  
  const handleOpenFullCalendar = useCallback(() => {
    setCurrentView('calendarFull');
  }, []);

  const handleResetData = useCallback(() => {
    if (window.confirm("Attenzione: Vuoi resettare il libretto allo stato iniziale? Perderai tutti i voti salvati.")) {
      setExams(initialExams);
      saveToFirestore(initialExams);
    }
  }, [user]);

  // Calcolo statistiche
  const stats = useMemo(() => {
    const totalCFU = exams.reduce((sum, exam) => sum + exam.cfu, 0);
    const completedExams = exams.filter((exam) => 
        exam.stato === ExamStatus.COMPLETED || (exam.voto !== null && exam.voto >= 18) || exam.isIdoneita
    );
    const completedCFU = completedExams.reduce((sum, exam) => sum + exam.cfu, 0);
    const gradedExams = completedExams.filter(exam => exam.voto !== null && exam.voto > 0 && !exam.isIdoneita);

    const progress = totalCFU > 0 ? (completedCFU / totalCFU) * 100 : 0;
    
    const arithmeticMean = gradedExams.length > 0
        ? gradedExams.reduce((sum, exam) => sum + exam.voto!, 0) / gradedExams.length
        : 0;
        
    const weightedMeanNumerator = gradedExams.reduce((sum, exam) => sum + exam.voto! * exam.cfu, 0);
    const weightedMeanDenominator = gradedExams.reduce((sum, exam) => sum + exam.cfu, 0);
    const weightedMean = weightedMeanDenominator > 0 ? weightedMeanNumerator / weightedMeanDenominator : 0;

    return { totalCFU, completedCFU, progress, arithmeticMean, weightedMean };
  }, [exams]);
  
  const selectedExam = useMemo(() => 
    selectedExamId ? exams.find(e => e.id === selectedExamId) : undefined,
    [selectedExamId, exams]
  );

  // --- RENDER ---
  
  if (authDomainError) {
    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full border border-red-400 animate-fade-in">
             <h2 className="text-xl font-bold text-red-600 mb-4">Configurazione Richiesta</h2>
             <p className="text-slate-600 mb-6 text-sm">Autorizza: <span className="font-mono font-bold">{authDomainError}</span></p>
             <button onClick={() => setAuthDomainError(null)} className="w-full py-3 px-4 bg-cyan-600 text-white rounded-md font-bold">Riprova</button>
          </div>
        </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900">
        <ArcReactor className="h-24 w-24 animate-spin-slow" />
        <p className="text-cyan-400 text-sm mt-4 tracking-widest uppercase">Inizializzazione Sistemi...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center relative overflow-hidden">
        {/* ... Login Screen ... */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        </div>
        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
          <div className="flex justify-center mb-6">
            <ArcReactor className="h-24 w-24 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
          </div>
          <h2 className="mt-2 text-center text-4xl font-extrabold text-white tracking-tight">
            A10 <span className="text-cyan-400">SYSTEMS</span>
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400 uppercase tracking-widest">
            Gestione Carriera Universitaria
          </p>
        </div>
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
          <div className="bg-white/10 backdrop-blur-lg py-8 px-4 shadow-2xl border border-white/10 rounded-2xl sm:px-10">
            <button onClick={handleLogin} className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-500 iron-flare">
               ACCEDI CON GOOGLE
            </button>
            <div className="mt-4">
                <button onClick={handleGuestLogin} className="w-full flex justify-center items-center py-3 px-4 border border-slate-500/50 rounded-lg shadow-sm text-sm font-bold text-slate-300 hover:bg-white/5 iron-flare">
                    MODALITÀ OSPITE (DEMO)
                </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- CONTENT SWITCHING ---
  let content;

  switch (currentView) {
    case 'profile':
        content = (
            <ProfileView 
                profile={userProfile} 
                onSave={saveProfileToFirestore} 
                onBack={handleBackToDashboard} 
            />
        );
        break;
    case 'settings':
        content = (
            <SettingsView 
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleTheme}
                onBack={handleBackToDashboard}
                onTriggerSecret={() => setShowLoveCelebration(true)}
            />
        );
        break;
    case 'examDetail':
        if (selectedExam) {
            content = (
                <ExamDetail 
                  exam={selectedExam} 
                  onBack={handleBackToDashboard} 
                  onNotesChange={handleNotesChange} 
                  events={events}
                  onAddEvent={handleAddEvent}
                />
            );
        }
        break;
    case 'calendarFull':
        content = (
            <CalendarFullView 
                events={events} 
                onAddEvent={handleAddEvent}
                onUpdateEvent={handleUpdateEvent}
                onDeleteEvent={handleDeleteEvent}
                onBack={handleBackToDashboard}
                exams={exams}
            />
        );
        break;
    case 'dashboard':
    default:
        content = (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <StatisticsCard {...stats} />
                </div>
                <div className="lg:col-span-1 h-full">
                    <CalendarWidget 
                        events={events} 
                        onExpand={handleOpenFullCalendar}
                    />
                </div>
            </div>
            
            <ExamTable 
              exams={exams} 
              onExamSelect={handleExamSelect} 
              onGradeChange={handleGradeChange}
              onEditExam={handleOpenEditExam}
              onAddExam={handleOpenAddExam}
            />
          </>
        );
        break;
  }

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 selection:bg-cyan-200 selection:text-cyan-900 transition-colors duration-300">
        
        {/* Exam Celebration */}
        {celebrationData && (
            <IronManCelebration 
            examName={celebrationData.name}
            grade={celebrationData.grade}
            cfu={celebrationData.cfu}
            onClose={() => setCelebrationData(null)}
            />
        )}

        {/* Love Celebration (Secret Mode) */}
        {showLoveCelebration && (
            <LoveCelebration onClose={() => setShowLoveCelebration(false)} />
        )}

        {isExamModalOpen && (
            <ExamFormModal 
                exam={currentExamToEdit} 
                onClose={() => setIsExamModalOpen(false)} 
                onSave={handleSaveExam}
                nextId={exams.length > 0 ? Math.max(...exams.map(e => e.id)) + 1 : 1}
            />
        )}
        
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300 h-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-between items-center">
                <div className="flex items-center space-x-4 group cursor-pointer" onClick={handleBackToDashboard}>
                    <div className="transition-transform transform group-hover:scale-110 duration-300 text-slate-900 dark:text-white">
                        <ArcReactor className="h-14 w-14" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                            A10 <span className="text-cyan-600 dark:text-cyan-400">SYSTEMS</span>
                        </h1>
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tracking-widest uppercase hidden sm:block">Scienze Giuridiche</span>
                    </div>
                </div>
                
                <div className="relative" ref={userMenuRef}>
                    <button 
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center gap-3 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                        <div className="flex flex-col items-end hidden md:flex">
                             <span className="text-base font-bold text-slate-700 dark:text-slate-200">
                                {userProfile.firstName} {userProfile.lastName}
                            </span>
                             <span className="text-xs text-slate-500 dark:text-slate-400">{userProfile.matricola || 'Studente'}</span>
                        </div>
                        {userProfile.photoURL ? (
                             <img src={userProfile.photoURL} alt="Profile" className="w-14 h-14 rounded-full border-2 border-cyan-200 dark:border-cyan-700 shadow-sm object-cover bg-slate-200" />
                        ) : (
                            <div className="w-14 h-14 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center text-cyan-700 dark:text-cyan-300 font-bold border-2 border-cyan-200 dark:border-cyan-700 shadow-sm text-xl">
                                {userProfile.firstName[0].toUpperCase()}
                            </div>
                        )}
                    </button>

                    {/* DROPDOWN MENU */}
                    {isUserMenuOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in z-50 origin-top-right">
                             <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 md:hidden">
                                 <p className="text-sm font-bold text-slate-800 dark:text-white">{userProfile.firstName}</p>
                                 <p className="text-xs text-slate-500 dark:text-slate-400">{userProfile.universityEmail || user.email}</p>
                             </div>
                             <div className="py-1">
                                <button onClick={() => { setCurrentView('profile'); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:text-cyan-700 dark:hover:text-cyan-400 flex items-center gap-3 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                    Profilo Utente
                                </button>
                                <button onClick={() => { setCurrentView('settings'); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:text-cyan-700 dark:hover:text-cyan-400 flex items-center gap-3 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    Impostazioni
                                </button>
                                <a 
                                    href="https://www.segrepass1.unina.it/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setIsUserMenuOpen(false)}
                                    className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:text-cyan-700 dark:hover:text-cyan-400 flex items-center gap-3 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                    Segrepass
                                </a>
                                <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                                <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                    Esci
                                </button>
                             </div>
                        </div>
                    )}
                </div>
            </div>
        </header>

        <main className="relative pb-20">
            {/* Dark Mode Background Overlay */}
            <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-cyan-50/50 dark:from-cyan-900/10 to-transparent -z-10 pointer-events-none"></div>
            
            {user.uid === 'guest-mode' && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                    <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-4 rounded-md shadow-sm flex items-start iron-flare">
                        <svg className="h-5 w-5 text-amber-400 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        <div>
                            <p className="text-sm text-amber-700 dark:text-amber-400 font-bold">Modalità Ospite Attiva</p>
                            <p className="text-xs text-amber-600 dark:text-amber-500">Le modifiche non verranno salvate nel cloud.</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
            <div className="px-4 sm:px-0">
                {content}
            </div>
            </div>
        </main>

        <JarvisAssistant exams={exams} userName={userProfile.firstName} />

        <footer className="text-center py-8 text-sm text-slate-400 dark:text-slate-600 mt-8 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <div className="flex items-center justify-center gap-2 mb-4">
                <div className={`w-2 h-2 rounded-full ${user.uid !== 'guest-mode' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                <span className="font-mono text-xs uppercase tracking-widest">{user.uid !== 'guest-mode' ? 'Online Sync' : 'Demo Offline'}</span>
            </div>
            <button onClick={handleResetData} className="text-xs text-slate-300 dark:text-slate-700 hover:text-red-400 underline transition-colors mb-8">Reset System</button>
        </footer>
        </div>
    </div>
  );
};

export default App;
