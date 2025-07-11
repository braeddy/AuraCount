'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Player } from '@/types';

interface PlayerCardProps {
  player: Player;
  rank: number;
  onChangeAura: (playerId: string, change: number, reason?: string) => void;
  onRemovePlayer: (playerId: string) => void;
}

export default function PlayerCard({ player, rank, onChangeAura, onRemovePlayer }: PlayerCardProps) {
  const [customAmount, setCustomAmount] = useState('');
  const [reason, setReason] = useState('');
  const router = useRouter();

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '👑';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🎭';
    }
  };

  const getAuraColor = (aura: number) => {
    if (aura >= 100000) return 'text-amber-600';
    if (aura >= 50000) return 'text-emerald-600';
    if (aura >= 0) return 'text-teal-600';
    return 'text-rose-600';
  };

  const formatAuraNumber = (aura: number) => {
    if (Math.abs(aura) >= 1000000) {
      return (aura / 1000000).toFixed(1) + 'M';
    } else if (Math.abs(aura) >= 1000) {
      return (aura / 1000).toFixed(1) + 'K';
    }
    return aura.toString();
  };

  const quickChange = (amount: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Previene il click sulla card
    onChangeAura(player.id, amount, reason.trim() || undefined);
    setReason('');
  };

  const customChange = (event: React.MouseEvent) => {
    event.stopPropagation();
    const amount = parseInt(customAmount);
    if (isNaN(amount) || amount === 0) return;
    
    onChangeAura(player.id, amount, reason.trim() || undefined);
    setCustomAmount('');
    setReason('');
  };

  const handleCardClick = () => {
    router.push(`/player/${player.id}`);
  };

  const handleRemoveClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (window.confirm(`Sei sicuro di voler rimuovere ${player.name}?`)) {
      onRemovePlayer(player.id);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="glass-card rounded-3xl p-6 hover:bg-white/70 transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-2xl">{getRankEmoji(rank)}</span>
          
          {/* Avatar e info */}
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center overflow-hidden border-2 border-white/50">
              {player.profileImage ? (
                <img 
                  src={player.profileImage} 
                  alt={player.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-slate-600 font-semibold text-lg">
                  {player.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-800">{player.name}</h3>
              <p className="text-slate-500 text-sm">#{rank} • Clicca per dettagli</p>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleRemoveClick}
          className="text-slate-400 hover:text-rose-500 transition-colors duration-200 opacity-0 group-hover:opacity-100"
          title="Rimuovi giocatore"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="text-center mb-6">
        <div className={`text-4xl font-light ${getAuraColor(player.aura)} mb-2`}>
          {formatAuraNumber(player.aura)}
        </div>
        <div className="text-slate-600 font-medium">Aura Points</div>
        <div className="text-slate-400 text-xs mt-1">
          Valore esatto: {player.aura.toLocaleString()}
        </div>
      </div>

      {/* Controllo personalizzato PRINCIPALE */}
      <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
        <h4 className="text-slate-700 font-semibold text-center mb-3">
          Aura Personalizzata
        </h4>
        <div className="space-y-3">
          <input
            type="number"
            value={customAmount}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="Inserisci quantità aura..."
            className="w-full px-4 py-3 rounded-xl bg-white/80 text-slate-800 placeholder-slate-400 text-center font-medium border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
          />
          <button
            onClick={customChange}
            disabled={!customAmount || parseInt(customAmount) === 0}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:from-slate-300 disabled:to-slate-400 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg"
          >
            Applica Aura
          </button>
        </div>
      </div>

      {/* Input per motivo */}
      <div className="mb-4">
        <input
          type="text"
          value={reason}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Motivo (opzionale)..."
          className="w-full px-3 py-2 rounded-xl bg-white/60 text-slate-700 placeholder-slate-400 text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300"
          maxLength={50}
        />
      </div>

      {/* Pulsanti quick change - ordine delle migliaia */}
      <div className="mb-4">
        <h5 className="text-slate-600 text-center mb-3 text-sm font-medium">Modifiche Rapide</h5>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={(e) => quickChange(1000, e)}
            className="bg-gradient-to-r from-emerald-100 to-cyan-100 hover:from-emerald-200 hover:to-cyan-200 text-slate-700 font-medium py-3 px-3 rounded-xl transition-all duration-200 border border-emerald-200"
          >
            +1K
          </button>
          <button
            onClick={(e) => quickChange(5000, e)}
            className="bg-gradient-to-r from-teal-100 to-blue-100 hover:from-teal-200 hover:to-blue-200 text-slate-700 font-medium py-3 px-3 rounded-xl transition-all duration-200 border border-teal-200"
          >
            +5K
          </button>
          <button
            onClick={(e) => quickChange(-1000, e)}
            className="bg-gradient-to-r from-rose-100 to-pink-100 hover:from-rose-200 hover:to-pink-200 text-slate-700 font-medium py-3 px-3 rounded-xl transition-all duration-200 border border-rose-200"
          >
            -1K
          </button>
          <button
            onClick={(e) => quickChange(-5000, e)}
            className="bg-gradient-to-r from-red-100 to-rose-100 hover:from-red-200 hover:to-rose-200 text-slate-700 font-medium py-3 px-3 rounded-xl transition-all duration-200 border border-red-200"
          >
            -5K
          </button>
        </div>
      </div>

    </div>
  );
}
