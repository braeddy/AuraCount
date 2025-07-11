import { useEffect, useState } from 'react';
import { DatabaseService } from '@/services/database';
import { Player, AuraAction } from '@/types';

export function useDatabase() {
  const [db] = useState(() => DatabaseService.getInstance());
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [actions, setActions] = useState<AuraAction[]>([]);

  // Funzione per ricaricare i dati
  const refreshData = async () => {
    setIsLoading(true);
    try {
      await db.refresh();
      setPlayers(db.getPlayers());
      setActions(db.getActions());
      setIsConnected(db.isConnected());
    } catch (error) {
      console.error('Errore nel caricamento dei dati:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Caricamento iniziale
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      // Aspetta un po' per permettere l'inizializzazione del database
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPlayers(db.getPlayers());
      setActions(db.getActions());
      setIsConnected(db.isConnected());
      setIsLoading(false);
    };

    loadInitialData();
  }, [db]);

  // Aggiungi giocatore
  const addPlayer = async (name: string): Promise<Player | null> => {
    try {
      const newPlayer = await db.addPlayer(name);
      setPlayers(db.getPlayers());
      return newPlayer;
    } catch (error) {
      console.error('Errore nell\'aggiunta del giocatore:', error);
      return null;
    }
  };

  // Aggiorna giocatore
  const updatePlayer = async (id: string, updates: Partial<Player>): Promise<Player | null> => {
    try {
      const updatedPlayer = await db.updatePlayer(id, updates);
      if (updatedPlayer) {
        setPlayers(db.getPlayers());
      }
      return updatedPlayer;
    } catch (error) {
      console.error('Errore nell\'aggiornamento del giocatore:', error);
      return null;
    }
  };

  // Rimuovi giocatore
  const removePlayer = async (id: string): Promise<boolean> => {
    try {
      const success = await db.removePlayer(id);
      if (success) {
        setPlayers(db.getPlayers());
        setActions(db.getActions());
      }
      return success;
    } catch (error) {
      console.error('Errore nella rimozione del giocatore:', error);
      return false;
    }
  };

  // Cambia aura
  const changeAura = async (playerId: string, change: number, reason?: string): Promise<boolean> => {
    try {
      const success = await db.changeAura(playerId, change, reason);
      if (success) {
        setPlayers(db.getPlayers());
        setActions(db.getActions());
      }
      return success;
    } catch (error) {
      console.error('Errore nel cambio aura:', error);
      return false;
    }
  };

  // Reset gioco
  const resetGame = async (): Promise<void> => {
    try {
      await db.resetGame();
      setPlayers([]);
      setActions([]);
    } catch (error) {
      console.error('Errore nel reset del gioco:', error);
    }
  };

  // Esporta dati
  const exportData = (): string => {
    return db.exportData();
  };

  // Importa dati
  const importData = async (data: string): Promise<boolean> => {
    try {
      const success = await db.importData(data);
      if (success) {
        setPlayers(db.getPlayers());
        setActions(db.getActions());
      }
      return success;
    } catch (error) {
      console.error('Errore nell\'importazione dei dati:', error);
      return false;
    }
  };

  return {
    // Stato
    isLoading,
    isConnected,
    players,
    actions,
    sortedPlayers: [...players].sort((a, b) => b.aura - a.aura),

    // Funzioni
    refreshData,
    addPlayer,
    updatePlayer,
    removePlayer,
    changeAura,
    resetGame,
    exportData,
    importData,

    // Database instance (per casi speciali)
    db
  };
}
