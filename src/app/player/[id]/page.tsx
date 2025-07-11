'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Player, AuraAction } from '@/types';
import { DatabaseService } from '@/services/database';
import PlayerStats from '@/components/PlayerStats';
import PlayerHistory from '@/components/PlayerHistory';
import ProfileImageUpload from '@/components/ProfileImageUpload';

export default function PlayerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [player, setPlayer] = useState<Player | null>(null);
  const [playerActions, setPlayerActions] = useState<AuraAction[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [db] = useState(() => DatabaseService.getInstance());

  const playerId = params.id as string;

  useEffect(() => {
    if (!playerId) return;
    
    const playerData = db.getPlayer(playerId);
    if (!playerData) {
      router.push('/');
      return;
    }
    
    setPlayer(playerData);
    setPlayerActions(db.getPlayerActions(playerId));
    setEditName(playerData.name);
    setEditBio(playerData.bio || '');
  }, [playerId, db, router]);

  const handleSaveChanges = async () => {
    if (!player) return;
    
    const updatedPlayer = await db.updatePlayer(player.id, {
      name: editName.trim(),
      bio: editBio.trim()
    });
    
    if (updatedPlayer) {
      setPlayer(updatedPlayer);
      setIsEditing(false);
    }
  };

  const handleProfileImageChange = async (imageUrl: string) => {
    if (!player) return;
    
    const updatedPlayer = await db.updatePlayer(player.id, {
      profileImage: imageUrl
    });
    
    if (updatedPlayer) {
      setPlayer(updatedPlayer);
    }
  };

  const handleAddAura = async (amount: number, reason?: string) => {
    if (!player) return;
    
    await db.changeAura(player.id, amount, reason);
    setPlayer(db.getPlayer(player.id)!);
    setPlayerActions(db.getPlayerActions(player.id));
  };

  if (!player) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="text-slate-600 text-xl">Caricamento...</div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header con pulsante indietro */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/game')}
            className="glass-card hover:bg-white/70 text-slate-700 font-medium px-6 py-3 rounded-2xl transition-all duration-300"
          >
            ← Torna alla Partita
          </button>
        </div>

        {/* Profilo del giocatore */}
        <div className="glass-card rounded-3xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Foto profilo */}
            <div className="flex-shrink-0">
              <ProfileImageUpload
                currentImage={player.profileImage}
                playerName={player.name}
                onImageChange={handleProfileImageChange}
              />
            </div>

            {/* Informazioni giocatore */}
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="text-3xl font-semibold bg-white/80 text-slate-800 rounded-2xl px-4 py-3 w-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder="Nome giocatore"
                  />
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full bg-white/80 text-slate-700 rounded-2xl px-4 py-3 resize-none border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder="Biografia del giocatore..."
                    rows={3}
                    maxLength={200}
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSaveChanges}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium px-6 py-3 rounded-2xl transition-all duration-200 shadow-lg"
                    >
                      Salva
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditName(player.name);
                        setEditBio(player.bio || '');
                      }}
                      className="bg-gradient-to-r from-slate-400 to-slate-500 hover:from-slate-500 hover:to-slate-600 text-white font-medium px-6 py-3 rounded-2xl transition-all duration-200"
                    >
                      Annulla
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="text-4xl font-semibold text-slate-800 mb-3">{player.name}</h1>
                  <div className={`text-6xl font-light ${getAuraColor(player.aura)} mb-3`}>
                    {formatAuraNumber(player.aura)}
                  </div>
                  <div className="text-slate-500 text-sm mb-4">
                    Valore esatto: {player.aura.toLocaleString()} aura
                  </div>
                  {player.bio && (
                    <p className="text-slate-600 text-lg mb-4">{player.bio}</p>
                  )}
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-gradient-to-r from-teal-100 to-blue-100 hover:from-teal-200 hover:to-blue-200 text-slate-700 font-medium px-6 py-3 rounded-2xl transition-all duration-200 border border-teal-200"
                  >
                    Modifica Profilo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Grid con statistiche e controlli */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Statistiche */}
          <PlayerStats player={player} actions={playerActions} />

          {/* Controlli rapidi */}
          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-2xl font-semibold text-slate-800 mb-6 text-center">
              Controlli Rapidi
            </h3>
            
            <QuickAuraControls onAddAura={handleAddAura} />
          </div>
        </div>

        {/* Storico azioni */}
        <div className="mt-8">
          <PlayerHistory actions={playerActions} />
        </div>
      </div>
    </div>
  );
}

// Componente per i controlli rapidi dell'aura
function QuickAuraControls({ onAddAura }: { onAddAura: (amount: number, reason?: string) => void }) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const quickAdd = (value: number) => {
    onAddAura(value, reason.trim() || undefined);
    setReason('');
  };

  const customAdd = () => {
    const num = parseInt(amount);
    if (isNaN(num) || num === 0) return;
    
    onAddAura(num, reason.trim() || undefined);
    setAmount('');
    setReason('');
  };

  return (
    <div className="space-y-6">
      {/* Input per motivo */}
      <input
        type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Motivo (opzionale)..."
        className="w-full px-4 py-3 rounded-2xl bg-white/80 text-slate-700 placeholder-slate-400 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        maxLength={100}
      />

      {/* Controllo personalizzato PRINCIPALE */}
      <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
        <h4 className="text-slate-700 font-semibold text-center mb-3">
          Aura Personalizzata
        </h4>
        <div className="space-y-3">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Quantità personalizzata..."
            className="w-full px-4 py-3 rounded-xl bg-white/80 text-slate-800 placeholder-slate-400 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 font-medium"
          />
          <button
            onClick={customAdd}
            disabled={!amount || parseInt(amount) === 0}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:from-slate-300 disabled:to-slate-400 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg"
          >
            Applica
          </button>
        </div>
      </div>

      {/* Pulsanti rapidi - ordine delle migliaia */}
      <div>
        <h5 className="text-slate-600 text-center mb-3 text-sm font-medium">Modifiche Rapide</h5>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => quickAdd(1000)}
            className="bg-gradient-to-r from-emerald-100 to-cyan-100 hover:from-emerald-200 hover:to-cyan-200 text-slate-700 font-medium py-3 px-4 rounded-xl transition-all duration-200 border border-emerald-200"
          >
            +1K
          </button>
          <button
            onClick={() => quickAdd(5000)}
            className="bg-gradient-to-r from-teal-100 to-blue-100 hover:from-teal-200 hover:to-blue-200 text-slate-700 font-medium py-3 px-4 rounded-xl transition-all duration-200 border border-teal-200"
          >
            +5K
          </button>
          <button
            onClick={() => quickAdd(-1000)}
            className="bg-gradient-to-r from-rose-100 to-pink-100 hover:from-rose-200 hover:to-pink-200 text-slate-700 font-medium py-3 px-4 rounded-xl transition-all duration-200 border border-rose-200"
          >
            -1K
          </button>
          <button
            onClick={() => quickAdd(-5000)}
            className="bg-gradient-to-r from-red-100 to-rose-100 hover:from-red-200 hover:to-rose-200 text-slate-700 font-medium py-3 px-4 rounded-xl transition-all duration-200 border border-red-200"
          >
            -5K
          </button>
        </div>
      </div>
    </div>
  );
}
