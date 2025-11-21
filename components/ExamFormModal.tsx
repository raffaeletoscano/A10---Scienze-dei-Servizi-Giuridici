
import React, { useState, useEffect } from 'react';
import { Exam, ExamStatus } from '../types';
import { ArcReactor } from './icons/ArcReactor';

interface ExamFormModalProps {
  exam?: Exam; // Se presente, siamo in modifica. Se null, siamo in creazione.
  onSave: (exam: Exam) => void;
  onClose: () => void;
  nextId: number;
}

export const ExamFormModal: React.FC<ExamFormModalProps> = ({ exam, onSave, onClose, nextId }) => {
  const [formData, setFormData] = useState<Partial<Exam>>({
    nome: '',
    codice: '',
    cfu: 6,
    anno: 1,
    settore: '',
    voto: null,
    lode: false,
    isIdoneita: false,
    notes: '',
    stato: ExamStatus.TODO
  });

  useEffect(() => {
    if (exam) {
      setFormData({ ...exam });
    } else {
      // Reset per nuovo esame
      setFormData({
        id: nextId,
        nome: '',
        codice: '',
        cfu: 6,
        anno: 1,
        settore: 'IUS/01',
        voto: null,
        lode: false,
        isIdoneita: false,
        notes: '',
        stato: ExamStatus.TODO
      });
    }
  }, [exam, nextId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;

    if (type === 'number') {
      finalValue = value === '' ? null : parseInt(value);
    } else if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    }

    setFormData(prev => {
      const newData = { ...prev, [name]: finalValue };
      
      // Logica automatica stato
      if (name === 'voto' || name === 'isIdoneita') {
        if (newData.isIdoneita) {
             newData.voto = null;
             newData.lode = false;
             newData.stato = ExamStatus.COMPLETED;
        } else if (newData.voto !== null && Number(newData.voto) > 0) {
             newData.stato = ExamStatus.COMPLETED;
        } else {
             newData.stato = ExamStatus.TODO;
        }
      }
      
      // Reset lode se voto < 30
      if (name === 'voto' && Number(finalValue) < 30) {
          newData.lode = false;
      }

      return newData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validazione base
    if (!formData.nome) return alert("Il nome dell'esame è obbligatorio");

    // Costruzione oggetto finale
    const finalExam: Exam = {
      id: exam ? exam.id : nextId,
      nome: formData.nome!,
      codice: formData.codice || 'N/A',
      cfu: Number(formData.cfu) || 0,
      anno: Number(formData.anno) || 1,
      settore: formData.settore || 'N/A',
      notes: formData.notes || '',
      stato: (formData.isIdoneita || (formData.voto && formData.voto >= 18)) ? ExamStatus.COMPLETED : ExamStatus.TODO,
      voto: formData.isIdoneita ? null : (formData.voto ? Number(formData.voto) : null),
      lode: formData.lode || false,
      isIdoneita: formData.isIdoneita || false,
    };

    onSave(finalExam);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-fade-in iron-flare">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ArcReactor className="w-6 h-6" />
            {exam ? 'MODIFICA PROTOCOLLO ESAME' : 'INIZIALIZZA NUOVO ESAME'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar space-y-4">
          
          {/* Nome e Codice */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nome Insegnamento</label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-semibold"
                placeholder="Es. Diritto Privato"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Codice</label>
                    <input
                        type="text"
                        name="codice"
                        value={formData.codice}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="Es. IUS-01"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Settore</label>
                    <input
                        type="text"
                        name="settore"
                        value={formData.settore}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="Es. IUS/01"
                    />
                </div>
            </div>
          </div>

          {/* CFU e Anno */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">CFU</label>
              <input
                type="number"
                name="cfu"
                min="1"
                max="30"
                value={formData.cfu}
                onChange={handleChange}
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-center font-mono font-bold focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Anno Corso</label>
              <select
                name="anno"
                value={formData.anno}
                onChange={handleChange}
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-center font-mono font-bold focus:ring-2 focus:ring-cyan-500"
              >
                {[1, 2, 3, 4, 5, 6].map(y => <option key={y} value={y}>{y}° Anno</option>)}
              </select>
            </div>
          </div>

          {/* Sezione Voto e Stato */}
          <div className="border-t border-slate-100 pt-4">
             <div className="flex items-center justify-between mb-4">
                 <label className="text-sm font-bold text-slate-700">Esito Esame</label>
                 <div className="flex items-center gap-2">
                     <label className="flex items-center gap-2 cursor-pointer">
                         <input 
                            type="checkbox" 
                            name="isIdoneita" 
                            checked={formData.isIdoneita} 
                            onChange={handleChange}
                            className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500"
                         />
                         <span className="text-xs text-slate-600 font-medium">Solo Idoneità</span>
                     </label>
                 </div>
             </div>

             <div className="grid grid-cols-2 gap-6 items-start">
                <div className={`transition-opacity ${formData.isIdoneita ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Voto (18-30)</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            name="voto"
                            min="18"
                            max="30"
                            value={formData.voto ?? ''}
                            onChange={handleChange}
                            placeholder="-"
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-center font-bold text-lg focus:ring-2 focus:ring-cyan-500"
                            disabled={!!formData.isIdoneita}
                        />
                         <label className={`flex items-center justify-center px-3 rounded-lg border cursor-pointer transition-all ${formData.lode ? 'bg-yellow-100 border-yellow-300 text-yellow-700' : 'bg-slate-50 border-slate-200 text-slate-300'}`}>
                            <input 
                                type="checkbox" 
                                name="lode" 
                                checked={!!formData.lode} 
                                onChange={handleChange}
                                disabled={Number(formData.voto) !== 30 || !!formData.isIdoneita}
                                className="hidden"
                            />
                            <span className="text-xs font-bold">LODE</span>
                        </label>
                    </div>
                </div>
                
                <div className="flex flex-col items-center justify-center h-full">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Stato Attuale</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                        formData.stato === ExamStatus.COMPLETED 
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                        {formData.stato}
                    </span>
                </div>
             </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-6 flex gap-3">
            <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors"
            >
                ANNULLA
            </button>
            <button
                type="submit"
                className="flex-1 px-4 py-2 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-500 shadow-lg shadow-cyan-500/20 transition-all transform active:scale-95 iron-flare"
            >
                {exam ? 'SALVA MODIFICHE' : 'AGGIUNGI ESAME'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
