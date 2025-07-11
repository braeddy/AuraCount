'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface ProfileImageUploadProps {
  currentImage?: string;
  playerName: string;
  onImageChange: (imageUrl: string) => void;
}

export default function ProfileImageUpload({ currentImage, playerName, onImageChange }: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Verifica il tipo di file
    if (!file.type.startsWith('image/')) {
      alert('Per favore seleziona un file immagine valido');
      return;
    }

    // Verifica la dimensione del file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('L\'immagine è troppo grande. Dimensione massima: 5MB');
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageChange(result);
      setIsUploading(false);
    };

    reader.onerror = () => {
      alert('Errore nel caricamento dell\'immagine');
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="relative">
      <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center overflow-hidden border-4 border-white/50 shadow-lg">
        {currentImage ? (
          <Image 
            src={currentImage} 
            alt={playerName}
            width={128}
            height={128}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-slate-600 font-semibold text-4xl">
            {playerName.charAt(0).toUpperCase()}
          </span>
        )}
        
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-3xl">
            <div className="text-white text-sm">Caricamento...</div>
          </div>
        )}
      </div>

      {/* Pulsanti per gestire l'immagine */}
      <div className="mt-4 flex flex-col space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="bg-gradient-to-r from-emerald-100 to-cyan-100 hover:from-emerald-200 hover:to-cyan-200 disabled:from-slate-200 disabled:to-slate-300 text-slate-700 disabled:text-slate-400 font-medium py-2 px-4 rounded-2xl transition-all duration-200 text-sm border border-emerald-200 disabled:border-slate-200"
        >
          {currentImage ? 'Cambia Foto' : 'Aggiungi Foto'}
        </button>
        
        {currentImage && (
          <button
            onClick={removeImage}
            className="bg-gradient-to-r from-rose-100 to-pink-100 hover:from-rose-200 hover:to-pink-200 text-slate-700 font-medium py-2 px-4 rounded-2xl transition-all duration-200 text-sm border border-rose-200"
          >
            Rimuovi Foto
          </button>
        )}
      </div>

      <div className="mt-2 text-slate-500 text-xs text-center">
        Max 5MB • JPG, PNG, GIF
      </div>
    </div>
  );
}
