'use client';

import { useState, useEffect } from 'react';
import { Player, AuraAction } from '@/types';
import { useDatabase } from './useDatabase';
import { GameSessionService } from '@/services/gameSessionService';

export function useGameState() {
  const {
    isLoading,
    isConnected,
    players,
    actions,
    sortedPlayers,
    addPlayer: dbAddPlayer,
    updatePlayer: dbUpdatePlayer,
    removePlayer: dbRemovePlayer,
    changeAura: dbChangeAura,
    resetGame: dbResetGame,
    refreshData: dbRefreshData
  } = useDatabase();

  const [updateCounter, setUpdateCounter] = useState(0);
  const [sessionService] = useState(() => GameSessionService.getInstance());

  // Carica i dati all'avvio dalla sessione corrente
  useEffect(() => {
    const currentSession = sessionService.getCurrentSession();
    if (currentSession && players.length === 0) {
      // Se c'è una sessione e non abbiamo ancora caricato dati
      // Carica i dati della sessione (questo potrebbe essere gestito diversamente in futuro)
      console.log('Sessione corrente trovata:', currentSession.name);
    }
  }, [sessionService, players.length]);

  const refreshData = async () => {
    await dbRefreshData();
    setUpdateCounter(prev => prev + 1); // Forza re-render
    
    // Salva lo stato aggiornato nella sessione corrente
    const currentSession = sessionService.getCurrentSession();
    if (currentSession) {
      const gameState = {
        players,
        actions
      };
      sessionService.updateSessionGameState(currentSession.id, gameState);
    }
  };

  const addPlayer = async (name: string) => {
    const newPlayer = await dbAddPlayer(name);
    if (newPlayer) {
      setUpdateCounter(prev => prev + 1);
      
      // Aggiorna la sessione corrente
      const currentSession = sessionService.getCurrentSession();
      if (currentSession) {
        const gameState = { players, actions };
        sessionService.updateSessionGameState(currentSession.id, gameState);
      }
    }
    return newPlayer;
  };

  const removePlayer = async (playerId: string) => {
    const success = await dbRemovePlayer(playerId);
    if (success) {
      setUpdateCounter(prev => prev + 1);
      
      // Aggiorna la sessione corrente
      const currentSession = sessionService.getCurrentSession();
      if (currentSession) {
        const gameState = { players, actions };
        sessionService.updateSessionGameState(currentSession.id, gameState);
      }
    }
    return success;
  };

  const changeAura = async (playerId: string, change: number, reason?: string) => {
    const success = await dbChangeAura(playerId, change, reason);
    if (success) {
      setUpdateCounter(prev => prev + 1);
      
      // Aggiorna la sessione corrente
      const currentSession = sessionService.getCurrentSession();
      if (currentSession) {
        const gameState = { players, actions };
        sessionService.updateSessionGameState(currentSession.id, gameState);
      }
    }
    return success;
  };

  const updatePlayer = async (playerId: string, updates: Partial<Player>) => {
    const updatedPlayer = await dbUpdatePlayer(playerId, updates);
    if (updatedPlayer) {
      setUpdateCounter(prev => prev + 1);
      
      // Aggiorna la sessione corrente
      const currentSession = sessionService.getCurrentSession();
      if (currentSession) {
        const gameState = { players, actions };
        sessionService.updateSessionGameState(currentSession.id, gameState);
      }
    }
    return updatedPlayer;
  };

  const resetGame = async () => {
    await dbResetGame();
    setUpdateCounter(prev => prev + 1);
    
    // Aggiorna la sessione corrente
    const currentSession = sessionService.getCurrentSession();
    if (currentSession) {
      const gameState = { players: [], actions: [] };
      sessionService.updateSessionGameState(currentSession.id, gameState);
    }
  };

  return {
    // Stato del database
    isLoading,
    isConnected,
    
    // Dati
    players,
    sortedPlayers,
    actions,
    
    // Funzioni
    addPlayer,
    removePlayer,
    changeAura,
    updatePlayer,
    resetGame,
    refreshData,
    
    // Counter per forzare re-render se necessario
    updateCounter
  };
}
