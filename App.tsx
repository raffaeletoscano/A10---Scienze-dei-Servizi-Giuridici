
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Exam, ExamStatus } from './types';
import { initialExams } from './constants';
import { StatisticsCard } from './components/StatisticsCard';
import { ExamTable } from './components/ExamTable';
import { ExamDetail } from './components/ExamDetail';

// Import Firebase (usando percorso relativo corretto)
import { auth, db, googleProvider } from './firebaseConfig';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<Exam[]>(initialExams);
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const [authDomainError, setAuthDomainError] = useState<string | null>(null);

  // 1. Gestione Autenticazione
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Sincronizzazione Database in tempo reale
  useEffect(() => {
    if (!user) {
      setExams(initialExams); // Reset se sloggato
      return;
    }

    // Ascolta il documento dell'utente nel database
    const userDocRef = doc(db, "users", user.uid);
    
    const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        // Se esistono dati salvati, caricali
        const data = docSnap.data();
        if (data.exams) {
          setExams(data.exams);
        }
      } else {
        // Se è il primo accesso e non c'è il documento, crealo con i dati iniziali
        setDoc(userDocRef, { exams: initialExams }, { merge: true });
      }
    }, (error) => {
      console.error("Errore sync DB:", error);
    });

    return () => unsubscribeSnapshot();
  }, [user]);


  // Funzione generica per salvare su Firestore
  const saveToFirestore = async (newExams: Exam[]) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, { exams: newExams }, { merge: true });
    } catch (e) {
      console.error("Errore salvataggio:", e);
      alert("Errore nel salvataggio cloud. Controlla la connessione.");
    }
  };

  const handleLogin = async () => {
    setAuthDomainError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Errore login:", error);
      if (error.code === 'auth/unauthorized-domain') {
        // Cattura il dominio corrente per mostrarlo all'utente
        setAuthDomainError(window.location.hostname);
      } else if (error.code === 'auth/popup-closed-by-user') {
        // L'utente ha chiuso la finestra, nessun errore da mostrare
      } else {
        alert(`Errore durante il login: ${error.message}`);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setSelectedExamId(null);
    } catch (error) {
      console.error("Errore logout:", error);
    }
  };

  // Modifica Voti: Aggiorna stato locale E Cloud
  const handleGradeChange = useCallback((examId: number, grade: number | null) => {
    const updatedExams = exams.map((exam) => {
      if (exam.id !== examId) return exam;
      
      if (grade !== null) {
        return { ...exam, voto: grade, stato: ExamStatus.COMPLETED };
      } else {
        return { ...exam, voto: null, stato: ExamStatus.TODO };
      }
    });
    
    // Aggiornamento ottimistico UI
    setExams(updatedExams);
    // Salvataggio Cloud
    saveToFirestore(updatedExams);
  }, [exams, user]);

  // Modifica Note: Aggiorna stato locale E Cloud
  const handleNotesChange = useCallback((examId: number, notes: string) => {
    const updatedExams = exams.map(exam => 
      exam.id === examId ? { ...exam, notes } : exam
    );
    setExams(updatedExams);
    saveToFirestore(updatedExams);
  }, [exams, user]);

  const handleBackToList = useCallback(() => {
    setSelectedExamId(null);
  }, []);

  const handleExamSelect = useCallback((examId: number) => {
    setSelectedExamId(examId);
  }, []);

  // Ripristino dati iniziali nel Cloud
  const handleResetData = useCallback(() => {
    if (window.confirm("Attenzione: Vuoi resettare il libretto allo stato iniziale? Perderai tutti i voti salvati.")) {
      setExams(initialExams);
      saveToFirestore(initialExams);
    }
  }, [user]);


  const stats = useMemo(() => {
    const totalCFU = exams.reduce((sum, exam) => sum + exam.cfu, 0);
    const completedExams = exams.filter((exam) => exam.stato === ExamStatus.COMPLETED);
    const completedExamsWithGrade = completedExams.filter((exam) => exam.voto !== null && exam.voto > 0);
    const completedCFU = completedExams.reduce((sum, exam) => sum + exam.cfu, 0);
    const progress = totalCFU > 0 ? (completedCFU / totalCFU) * 100 : 0;
    const arithmeticMean = completedExamsWithGrade.length > 0
        ? completedExamsWithGrade.reduce((sum, exam) => sum + exam.voto!, 0) / completedExamsWithGrade.length
        : 0;
    const weightedMeanNumerator = completedExamsWithGrade.reduce((sum, exam) => sum + exam.voto! * exam.cfu, 0);
    const weightedMeanDenominator = completedExamsWithGrade.reduce((sum, exam) => sum + exam.cfu, 0);
    const weightedMean = weightedMeanDenominator > 0 ? weightedMeanNumerator / weightedMeanDenominator : 0;

    return { totalCFU, completedCFU, progress, arithmeticMean, weightedMean };
  }, [exams]);
  
  const selectedExam = useMemo(() => 
    selectedExamId ? exams.find(e => e.id === selectedExamId) : undefined,
    [selectedExamId, exams]
  );

  const copyDomainToClipboard = () => {
    if (authDomainError) {
      navigator.clipboard.writeText(authDomainError);
      alert("Dominio copiato! Ora incollalo nella console Firebase.");
    }
  };

  // --- RENDERING ---

  // 1. Schermata Errore Dominio (Se rilevato)
  if (authDomainError) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full border border-red-200 animate-fade-in">
          <div className="flex items-center mb-4 text-red-600">
            <svg className="w-8 h-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-bold">Configurazione Richiesta</h2>
          </div>
          <p className="text-slate-600 mb-6 text-sm">
            Per accedere da questo ambiente di anteprima, devi autorizzare il seguente dominio su Firebase:
          </p>
          
          <div className="mb-6 flex gap-2 items-center">
            <div className="bg-slate-100 p-3 rounded-md font-mono text-sm text-slate-800 border border-slate-300 flex-grow overflow-hidden text-ellipsis whitespace-nowrap">
              {authDomainError}
            </div>
            <button 
              onClick={copyDomainToClipboard}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-3 rounded-md font-bold text-sm transition-colors border border-slate-300"
            >
              COPIA
            </button>
          </div>

          <p className="text-sm text-slate-500 mb-2 font-semibold">Passaggi da seguire:</p>
          <ol className="list-decimal list-inside text-sm text-slate-600 space-y-2 mb-8">
            <li>Copia il dominio qui sopra.</li>
            <li>Vai sulla <a href="https://console.firebase.google.com/project/a10librettouniversitario/authentication/settings" target="_blank" rel="noreferrer" className="text-sky-600 underline hover:text-sky-800 font-medium">Console Firebase &rarr; Settings &rarr; Authorized domains</a>.</li>
            <li>Clicca <strong>Add domain</strong> e incolla.</li>
          </ol>
          
          <button 
            onClick={() => setAuthDomainError(null)}
            className="w-full py-3 px-4 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors font-medium shadow-sm"
          >
            Fatto! Riprova Login
          </button>
        </div>
      </div>
    );
  }

  // 2. Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mb-4"></div>
        <p className="text-slate-500 text-sm animate-pulse">Caricamento libretto...</p>
      </div>
    );
  }

  // 3. Login Screen (se non loggato)
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-sky-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 16c1.255 0 2.443-.29 3.5-.804V4.804zM14.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 0114.5 16c1.255 0 2.443-.29 3.5-.804v-10A7.968 7.968 0 0014.5 4z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
            Il tuo Libretto Online
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Accedi per gestire i tuoi esami e sincronizzarli su tutti i dispositivi.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <button
              onClick={handleLogin}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
            >
              <svg className="h-5 w-5 mr-2 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Accedi con Google
            </button>

            <div className="mt-6 text-center">
              <button 
                onClick={() => setAuthDomainError(window.location.hostname)}
                className="text-xs text-slate-400 hover:text-sky-600 underline transition-colors"
              >
                Problemi con il login? Configura dominio
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. Main App (se loggato)
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
          onExamSelect={handleExamSelect} 
          onGradeChange={handleGradeChange}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center space-x-3">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sky-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 16c1.255 0 2.443-.29 3.5-.804V4.804zM14.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 0114.5 16c1.255 0 2.443-.29 3.5-.804v-10A7.968 7.968 0 0014.5 4z" />
                </svg>
                <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-slate-900 hidden sm:block">
                    A10 - Scienze Giuridiche
                </h1>
                <h1 className="text-xl font-bold leading-tight text-slate-900 sm:hidden">
                    Libretto A10
                </h1>
            </div>
            <div className="flex items-center gap-4">
                {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || "User"} className="w-8 h-8 rounded-full border border-slate-300" />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold">
                        {user.email ? user.email[0].toUpperCase() : "U"}
                    </div>
                )}
                <button 
                    onClick={handleLogout}
                    className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors"
                >
                    Esci
                </button>
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
      <footer className="text-center py-6 text-sm text-slate-400 pb-12">
        <p>Cloud Sync Attivo <span className="text-green-500">●</span></p>
        <div className="mt-4">
          <button 
            onClick={handleResetData}
            className="text-xs text-red-400 hover:text-red-600 underline cursor-pointer transition-colors"
          >
            Resetta voti
          </button>
        </div>
        
        <div className="mt-6 flex justify-center">
            <a 
                href="https://www.segrepass1.unina.it/Welcome.do" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-block p-4 bg-slate-800 rounded-xl transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 focus:ring-sky-500"
            >
                 <svg width="140" height="42" viewBox="0 0 314 93" xmlns="http://www.w3.org/2000/svg" className="block">
                    <path d="M0 0 H250 C285 20, 285 73, 250 93 H0 Z" fill="#DC2626"/>
                    <path d="M250 0 H314 V93 H250 C285 73, 285 20, 250 0 Z" fill="#6B7280"/>
                    <text x="157" y="68" fontFamily="Inter, sans-serif" fontSize="55" fontWeight="900" fontStyle="italic" fill="white" textAnchor="middle" letterSpacing="-1">SEGREPASS</text>
                </svg>
            </a>
        </div>
      </footer>
    </div>
  );
};

export default App;
