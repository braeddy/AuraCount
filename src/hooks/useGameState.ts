'use client';

import { useState, useEffect } from 'react';
import { Player, AuraAction } from '@/types';
import { DatabaseService } from '@/services/database';
import { GameSessionService } from '@/services/gameSessionService';

export function useGameState() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [actions, setActions] = useState<AuraAction[]>([]);
  const [updateCounter, setUpdateCounter] = useState(0);
  const [db] = useState(() => DatabaseService.getInstance());
  const [sessionService] = useState(() => GameSessionService.getInstance());

  // Carica i dati all'avvio dalla sessione corrente
  useEffect(() => {
    const currentSession = sessionService.getCurrentSession();
    if (currentSession) {
      // Carica i dati della sessione nel DatabaseService
      db.loadFromGameState(currentSession.gameState);
      setPlayers(db.getPlayers());
      setActions(db.getActions());
    }
  }, [db, sessionService]);

  const refreshData = () => {
    setPlayers(db.getPlayers());
    setActions(db.getActions());
    setUpdateCounter(prev => prev + 1); // Forza re-render
    
    // Salva lo stato aggiornato nella sessione corrente
    const currentSession = sessionService.getCurrentSession();
    if (currentSession) {
      const gameState = {
        players: db.getPlayers(),
        actions: db.getActions()
      };
      sessionService.updateSessionGameState(currentSession.id, gameState);
    }
  };

  const addPlayer = (name: string) => {
    const newPlayer = db.addPlayer(name);
    refreshData();
  };

  const removePlayer = (playerId: string) => {
    db.removePlayer(playerId);
    refreshData();
  };

  const changeAura = (playerId: string, change: number, reason?: string) => {
    db.changeAura(playerId, change, reason);
    refreshData();
  };

  const updatePlayer = (playerId: string, updates: Partial<Player>) => {
    db.updatePlayer(playerId, updates);
    refreshData();
  };

  const resetGame = () => {
    db.resetGame();
    refreshData();
  };

  // Ordina i giocatori per aura (dal più alto al più basso) usando lo stato locale
  const sortedPlayers = [...players].sort((a, b) => b.aura - a.aura);

  return {
    players,
    sortedPlayers,
    actions,
    addPlayer,
    removePlayer,
    changeAura,
    updatePlayer,
    resetGame,
    refreshData
  };
}
