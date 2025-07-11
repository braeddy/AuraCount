'use client';

import { useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import PlayerCard from '@/components/PlayerCard';
import AddPlayerForm from '@/components/AddPlayerForm';
import ActionHistory from '@/components/ActionHistory';
import Header from '@/components/Header';

export default function GamePage() {
  const { 
    sortedPlayers, 
    actions, 
    addPlayer, 
    removePlayer, 
    changeAura, 
    resetGame,
    isLoading,
    isConnected
  } = useGameState();
  const [showHistory, setShowHistory] = useState(false);

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <Header 
        playersCount={sortedPlayers.length}
        onToggleHistory={() => setShowHistory(!showHistory)}
        onResetGame={resetGame}
        showHistory={showHistory}
        isLoading={isLoading}
        isConnected={isConnected}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sezione principale */}
        <div className="lg:col-span-2">
          {/* Form aggiunta giocatore */}
          <div className="mb-8">
            <AddPlayerForm 
              key={`form-${sortedPlayers.length}`}
              onAddPlayer={addPlayer} 
              existingPlayers={sortedPlayers} 
            />
          </div>

          {/* Lista giocatori */}
          {sortedPlayers.length === 0 ? (
            <div className="glass-card rounded-3xl p-8 text-center">
              <h3 className="text-2xl font-semibold text-slate-800 mb-4">Inizia il Gioco!</h3>
              <p className="text-slate-600 text-lg">
                Aggiungi i tuoi amici per iniziare a tracciare la loro aura!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" key={`players-${sortedPlayers.length}`}>
              {sortedPlayers.map((player, index) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  rank={index + 1}
                  onChangeAura={changeAura}
                  onRemovePlayer={removePlayer}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar storico */}
        <div className={`lg:block ${showHistory ? 'block' : 'hidden'}`}>
          <ActionHistory actions={actions} />
        </div>
      </div>
    </main>
  );
}
