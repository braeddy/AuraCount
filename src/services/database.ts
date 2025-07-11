'use client';

import { Player, AuraAction, GameState } from '@/types';

const STORAGE_KEY = 'auracount-game-state';
const BACKUP_KEY = 'auracount-backup';

export class DatabaseService {
  private static instance: DatabaseService;
  private gameState: GameState = { players: [], actions: [] };

  private constructor() {
    this.loadFromStorage();
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Carica i dati dal localStorage
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedState = JSON.parse(saved);
        // Converti le date da stringhe
        parsedState.players = parsedState.players.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt)
        }));
        parsedState.actions = parsedState.actions.map((a: any) => ({
          ...a,
          timestamp: new Date(a.timestamp)
        }));
        this.gameState = parsedState;
      }
    } catch (error) {
      console.error('Errore nel caricamento dei dati:', error);
      this.loadBackup();
    }
  }

  // Salva i dati nel localStorage
  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.gameState));
      // Crea un backup
      localStorage.setItem(BACKUP_KEY, JSON.stringify(this.gameState));
    } catch (error) {
      console.error('Errore nel salvataggio dei dati:', error);
    }
  }

  // Carica il backup
  private loadBackup(): void {
    try {
      const backup = localStorage.getItem(BACKUP_KEY);
      if (backup) {
        this.gameState = JSON.parse(backup);
      }
    } catch (error) {
      console.error('Errore nel caricamento del backup:', error);
    }
  }

  // Carica dati da un GameState esterno (per le sessioni)
  loadFromGameState(gameState: GameState): void {
    this.gameState = {
      players: gameState.players.map(p => ({
        ...p,
        createdAt: new Date(p.createdAt)
      })),
      actions: gameState.actions.map(a => ({
        ...a,
        timestamp: new Date(a.timestamp)
      }))
    };
  }

  // Ottieni tutti i giocatori
  getPlayers(): Player[] {
    return this.gameState.players;
  }

  // Ottieni giocatori ordinati per aura
  getSortedPlayers(): Player[] {
    return [...this.gameState.players].sort((a, b) => b.aura - a.aura);
  }

  // Ottieni un giocatore specifico
  getPlayer(id: string): Player | undefined {
    return this.gameState.players.find(p => p.id === id);
  }

  // Aggiungi un nuovo giocatore
  addPlayer(name: string): Player {
    const newPlayer: Player = {
      id: Date.now().toString(),
      name: name.trim(),
      aura: 0,
      createdAt: new Date(),
      bio: ''
    };

    this.gameState.players.push(newPlayer);
    this.saveToStorage();
    return newPlayer;
  }

  // Aggiorna un giocatore
  updatePlayer(id: string, updates: Partial<Player>): Player | null {
    const playerIndex = this.gameState.players.findIndex(p => p.id === id);
    if (playerIndex === -1) return null;

    this.gameState.players[playerIndex] = {
      ...this.gameState.players[playerIndex],
      ...updates
    };
    
    this.saveToStorage();
    return this.gameState.players[playerIndex];
  }

  // Rimuovi un giocatore
  removePlayer(id: string): boolean {
    const initialLength = this.gameState.players.length;
    this.gameState.players = this.gameState.players.filter(p => p.id !== id);
    this.gameState.actions = this.gameState.actions.filter(a => a.playerId !== id);
    
    if (this.gameState.players.length < initialLength) {
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Cambia aura di un giocatore
  changeAura(playerId: string, change: number, reason?: string): boolean {
    const player = this.getPlayer(playerId);
    if (!player) return false;

    // Aggiorna l'aura del giocatore
    this.updatePlayer(playerId, { aura: player.aura + change });

    // Aggiungi l'azione allo storico
    const action: AuraAction = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      playerId,
      playerName: player.name,
      change,
      timestamp: new Date(),
      reason
    };

    this.gameState.actions.unshift(action);
    // Mantieni solo le ultime 1000 azioni
    this.gameState.actions = this.gameState.actions.slice(0, 1000);
    
    this.saveToStorage();
    return true;
  }

  // Ottieni tutte le azioni
  getActions(): AuraAction[] {
    return this.gameState.actions;
  }

  // Ottieni azioni di un giocatore specifico
  getPlayerActions(playerId: string): AuraAction[] {
    return this.gameState.actions.filter(a => a.playerId === playerId);
  }

  // Reset del gioco
  resetGame(): void {
    this.gameState = { players: [], actions: [] };
    this.saveToStorage();
  }

  // Esporta i dati
  exportData(): string {
    return JSON.stringify(this.gameState, null, 2);
  }

  // Importa i dati
  importData(data: string): boolean {
    try {
      const imported = JSON.parse(data);
      if (imported.players && imported.actions) {
        this.gameState = imported;
        this.saveToStorage();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Errore nell\'importazione:', error);
      return false;
    }
  }
}
