'use client';

import { useEffect } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Conferma',
  cancelText = 'Annulla',
  onConfirm,
  onCancel,
  isDangerous = false
}: ConfirmModalProps) {
  // Chiudi con ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Previeni lo scroll del body quando il modal è aperto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-white/95 backdrop-blur-md rounded-3xl p-8 mx-4 max-w-md w-full shadow-2xl border border-white/20">
        {/* Icona di avvertimento per azioni pericolose */}
        {isDangerous && (
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">⚠️</span>
            </div>
          </div>
        )}

        {/* Titolo */}
        <h3 className="text-2xl font-semibold text-slate-800 mb-4 text-center">
          {title}
        </h3>
        
        {/* Messaggio */}
        <p className="text-slate-600 text-center mb-8 leading-relaxed">
          {message}
        </p>
        
        {/* Pulsanti */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 font-medium py-3 px-6 rounded-2xl transition-all duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 font-medium py-3 px-6 rounded-2xl transition-all duration-200 ${
              isDangerous
                ? 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-lg'
                : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
