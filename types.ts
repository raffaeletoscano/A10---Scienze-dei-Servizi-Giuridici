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
  settore: string;
  notes: string;
}

export type SortableExamKeys = keyof Exam;

export interface SortConfig {
  key: SortableExamKeys;
  direction: 'ascending' | 'descending';
}