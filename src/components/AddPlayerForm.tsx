'use client';

import { useState } from 'react';
import { Player } from '@/types';

interface AddPlayerFormProps {
  onAddPlayer: (name: string) => void;
  existingPlayers: Player[];
}

export default function AddPlayerForm({ onAddPlayer, existingPlayers }: AddPlayerFormProps) {
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const name = playerName.trim();
    
    if (!name) {
      setError('Il nome non può essere vuoto!');
      return;
    }
    
    if (name.length < 2) {
      setError('Il nome deve essere di almeno 2 caratteri!');
      return;
    }
    
    if (existingPlayers.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      setError('Questo nome è già in uso!');
      return;
    }
    
    onAddPlayer(name);
    setPlayerName('');
    setError('');
  };

  return (
    <div className="glass-card rounded-3xl p-6">
      <h2 className="text-2xl font-semibold text-slate-800 mb-6 text-center">
        Aggiungi Giocatore
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={playerName}
            onChange={(e) => {
              setPlayerName(e.target.value);
              setError('');
            }}
            placeholder="Nome del giocatore..."
            className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 focus:ring-2 focus:ring-indigo-300 focus:outline-none focus:border-transparent text-slate-800 placeholder-slate-400 font-medium"
            maxLength={20}
          />
          {error && (
            <p className="text-rose-600 text-sm mt-2 font-medium">
              {error}
            </p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={!playerName.trim()}
          className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 disabled:from-slate-300 disabled:to-slate-400 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 disabled:cursor-not-allowed shadow-lg"
        >
          Aggiungi al Gioco
        </button>
      </form>
    </div>
  );
}
