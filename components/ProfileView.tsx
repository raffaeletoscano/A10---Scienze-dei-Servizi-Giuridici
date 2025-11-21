
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { ArcReactor } from './icons/ArcReactor';

interface ProfileViewProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onBack: () => void;
}

interface Point {
    x: number;
    y: number;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ profile, onSave, onBack }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [isEditing, setIsEditing] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image Editor State
  const [editingImageSrc, setEditingImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Point>({ x: 0, y: 0 });
  const editorCanvasRef = useRef<HTMLCanvasElement>(null);

  // Reset form data when profile prop changes
  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsEditing(false);
  };

  const handleCopy = (text: string, fieldName: string) => {
      if (!text) return;
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
  };

  const handleImageClick = () => {
    if (isEditing) {
        fileInputRef.current?.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Apre l'editor invece di salvare direttamente
        setEditingImageSrc(reader.result as string);
        setZoom(1);
        setOffset({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
    // Reset input value to allow re-selecting same file
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- IMAGE EDITOR LOGIC ---

  const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      setOffset({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
      });
  };

  const handleMouseUp = () => {
      setIsDragging(false);
  };

  const handleSaveCrop = () => {
      if (!editingImageSrc) return;

      const canvas = document.createElement('canvas');
      const size = 300; // Risoluzione output
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
          const img = new Image();
          img.src = editingImageSrc;
          img.onload = () => {
              // Sfondo bianco
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, size, size);

              // Calcoli geometrici per applicare zoom e pan
              // Il centro del canvas è size/2. 
              // Applichiamo translate e scale.
              ctx.translate(size / 2, size / 2);
              ctx.translate(offset.x, offset.y);
              ctx.scale(zoom, zoom);
              
              // Disegna immagine centrata rispetto all'origine traslata
              // Se l'immagine è 1000x1000, disegniamo da -500 a 500
              ctx.drawImage(img, -img.width / 2, -img.height / 2);

              const finalUrl = canvas.toDataURL('image/jpeg', 0.9);
              setFormData(prev => ({ ...prev, photoURL: finalUrl }));
              setEditingImageSrc(null);
          };
      }
  };

  // Helper component per i campi con copia
  const FieldWithCopy = ({ label, name, value, type = "text", placeholder = "" }: { label: string, name: string, value: string, type?: string, placeholder?: string }) => (
    <div className="relative group">
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{label}</label>
        <div className="relative">
            <input 
                type={type} 
                name={name} 
                value={value} 
                onChange={handleChange} 
                disabled={!isEditing}
                className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg pl-4 pr-10 py-2.5 text-slate-800 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-colors ${!isEditing ? 'opacity-80' : ''}`}
                placeholder={placeholder}
            />
            <button
                type="button"
                onClick={() => handleCopy(value, name)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-cyan-600 dark:text-slate-500 dark:hover:text-cyan-400 bg-transparent rounded-md transition-colors"
                title="Copia negli appunti"
            >
                {copiedField === name ? (
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                )}
            </button>
        </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Torna alla Dashboard
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden iron-flare relative">
        {/* Header Background */}
        <div className="h-32 bg-gradient-to-r from-cyan-600 to-blue-600 relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-30"></div>
        </div>

        <div className="px-8 pb-8">
            {/* Avatar & Identity */}
            <div className="relative flex justify-between items-end -mt-12 mb-8">
                <div className="flex items-end gap-6">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                    />
                    <div 
                        onClick={handleImageClick}
                        className={`w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 flex items-center justify-center text-3xl font-bold text-cyan-600 shadow-lg relative overflow-hidden group ${isEditing ? 'cursor-pointer ring-2 ring-cyan-400 ring-offset-2 dark:ring-offset-slate-900' : ''}`}
                        title={isEditing ? "Clicca per cambiare foto" : ""}
                    >
                         {formData.photoURL ? (
                             <img src={formData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                         ) : (
                             <span>{formData.firstName[0]}{formData.lastName[0]}</span>
                         )}
                         
                         {isEditing && (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium backdrop-blur-sm">
                                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            </div>
                         )}
                    </div>
                    <div className="mb-2">
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            {formData.firstName} {formData.lastName}
                            <ArcReactor className="w-5 h-5 text-cyan-500" />
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-mono text-sm">{formData.matricola || 'Matricola non assegnata'}</p>
                    </div>
                </div>
                <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                        isEditing 
                        ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                        : 'bg-cyan-50 text-cyan-600 border border-cyan-200 hover:bg-cyan-100 dark:bg-cyan-900/20 dark:border-cyan-700 dark:text-cyan-400'
                    }`}
                >
                    {isEditing ? 'ANNULLA MODIFICHE' : 'MODIFICA PROFILO'}
                </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Sezione Personale */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700 pb-2 mb-4">Dati Anagrafici</h3>
                        
                        <FieldWithCopy label="Nome" name="firstName" value={formData.firstName} />
                        <FieldWithCopy label="Cognome" name="lastName" value={formData.lastName} />
                        <FieldWithCopy label="Telefono" name="phoneNumber" value={formData.phoneNumber} type="tel" placeholder="+39..." />
                        <FieldWithCopy label="Email Personale" name="personalEmail" value={formData.personalEmail} type="email" />
                    </div>

                    {/* Sezione Accademica */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700 pb-2 mb-4">Dati Accademici</h3>

                        <FieldWithCopy label="Matricola" name="matricola" value={formData.matricola} />
                        <FieldWithCopy label="Email Universitaria" name="universityEmail" value={formData.universityEmail} type="email" />
                    </div>
                </div>

                {isEditing && (
                    <div className="mt-8 flex justify-end animate-fade-in">
                        <button 
                            type="submit"
                            className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-cyan-500/30 transform hover:scale-105 transition-all"
                        >
                            SALVA MODIFICHE
                        </button>
                    </div>
                )}
            </form>
        </div>
      </div>

      {/* --- IMAGE EDITOR MODAL --- */}
      {editingImageSrc && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md animate-fade-in">
              <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl max-w-md w-full border border-cyan-500/30 iron-flare">
                  <div className="p-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                          <ArcReactor className="w-5 h-5 text-cyan-500" />
                          EDITOR OTTICO
                      </h3>
                      <button onClick={() => setEditingImageSrc(null)} className="text-slate-400 hover:text-red-500">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                  </div>
                  
                  <div className="p-6 flex flex-col items-center">
                      {/* Viewport */}
                      <div 
                          className="w-[280px] h-[280px] bg-slate-900 relative overflow-hidden cursor-move border-2 border-cyan-500/50 rounded-lg shadow-inner"
                          onMouseDown={handleMouseDown}
                          onMouseMove={handleMouseMove}
                          onMouseUp={handleMouseUp}
                          onMouseLeave={handleMouseUp}
                      >
                          {/* Image Layer */}
                          <img 
                              src={editingImageSrc} 
                              alt="Edit" 
                              className="absolute origin-center max-w-none select-none pointer-events-none"
                              style={{ 
                                  transform: `translate(-50%, -50%) translate(${140 + offset.x}px, ${140 + offset.y}px) scale(${zoom})`,
                                  top: '0',
                                  left: '0',
                              }}
                              draggable={false}
                          />
                          
                          {/* Mask Overlay (Black with transparent circle) */}
                          <div className="absolute inset-0 pointer-events-none">
                              <svg width="100%" height="100%">
                                  <defs>
                                      <mask id="circle-mask">
                                          <rect width="100%" height="100%" fill="white" />
                                          <circle cx="50%" cy="50%" r="100" fill="black" />
                                      </mask>
                                  </defs>
                                  <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#circle-mask)" />
                                  {/* Decorative Circle Border */}
                                  <circle cx="50%" cy="50%" r="100" fill="none" stroke="#06b6d4" strokeWidth="2" strokeDasharray="10 5" className="opacity-50" />
                              </svg>
                          </div>

                          {/* Grid Overlay */}
                          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20">
                              <div className="border-r border-white"></div>
                              <div className="border-r border-white"></div>
                              <div></div>
                              <div className="border-t border-white col-span-3"></div>
                              <div className="border-t border-white col-span-3 row-start-3"></div>
                          </div>
                      </div>

                      {/* Controls */}
                      <div className="w-full mt-6 space-y-4">
                          <div className="flex items-center gap-4">
                              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/></svg>
                              <input 
                                  type="range" 
                                  min="0.5" 
                                  max="3" 
                                  step="0.05" 
                                  value={zoom} 
                                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                              />
                              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"/></svg>
                          </div>

                          <p className="text-xs text-center text-slate-400 dark:text-slate-500">
                              Trascina per spostare • Usa lo slider per zoomare
                          </p>

                          <button 
                              onClick={handleSaveCrop}
                              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg shadow-lg shadow-cyan-500/20 uppercase tracking-widest transition-all transform active:scale-95 flex justify-center items-center gap-2"
                          >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                              Conferma Foto
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
