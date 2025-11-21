import { GoogleGenAI } from "@google/genai";
import { Exam, ExamStatus } from "../types";

// Inizializza il client Gemini
// NOTA: @google/genai è caricato via CDN (importmap) e configurato come external in vite.config.ts
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const askJarvis = async (userMessage: string, exams: Exam[]) => {
  try {
    // Costruiamo il contesto dati per l'AI
    const completedExams = exams.filter(e => e.stato === ExamStatus.COMPLETED);
    const todoExams = exams.filter(e => e.stato === ExamStatus.TODO);
    
    const totalCFU = exams.reduce((acc, curr) => acc + curr.cfu, 0);
    const acquiredCFU = completedExams.reduce((acc, curr) => acc + curr.cfu, 0);
    
    // Calcolo rapido media
    const validGrades = completedExams.filter(e => e.voto !== null).map(e => e.voto as number);
    const average = validGrades.length > 0 
        ? (validGrades.reduce((a, b) => a + b, 0) / validGrades.length).toFixed(2) 
        : "N/A";

    const systemInstruction = `
      Sei J.A.R.V.I.S., un assistente AI avanzato per la gestione della carriera universitaria.
      
      DATI STUDENTE:
      - Completati: ${completedExams.length}/${exams.length}
      - CFU: ${acquiredCFU}/${totalCFU}
      - Media: ${average}
      
      RISPONDI BREVEMENTE E IN MODO UTILE.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userMessage,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Errore J.A.R.V.I.S.:", error);
    return "Sistemi offline. Impossibile connettersi al server neurale.";
  }
};