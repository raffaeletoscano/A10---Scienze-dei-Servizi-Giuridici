

export enum ExamStatus {
  COMPLETED = 'Completato',
  TODO = 'Da completare',
}

export interface Exam {
  id: number;
  nome: string;
  codice: string;
  anno: number;
  cfu: number;
  stato: ExamStatus;
  voto: number | null;
  lode?: boolean;
  isIdoneita?: boolean;
  settore: string;
  notes: string;
}

export type SortableExamKeys = keyof Exam;

export interface SortConfig {
  key: SortableExamKeys;
  direction: 'ascending' | 'descending';
}

export type EventType = 'exam' | 'study' | 'deadline' | 'other';

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date; // Oggetto Date javascript
  type: EventType;
  examId?: number; // Opzionale: collegamento a un esame specifico
  description?: string;
  completed?: boolean;
  notes?: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  matricola: string;
  universityEmail: string;
  personalEmail: string;
  phoneNumber: string;
  photoURL?: string;
}