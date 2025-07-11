'use client';

import { GameSession, GameSessionsState, GameState } from '@/types';

const SESSIONS_KEY = 'auracount-game-sessions';

export class GameSessionService {
  private static instance: GameSessionService;
  private sessionsState: GameSessionsState = { sessions: [] };

  private constructor() {
    this.loadFromStorage();
  }

  static getInstance(): GameSessionService {
    if (!GameSessionService.instance) {
      GameSessionService.instance = new GameSessionService();
    }
    return GameSessionService.instance;
  }

  // Carica le sessioni dal localStorage
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const saved = localStorage.getItem(SESSIONS_KEY);
      if (saved) {
        const parsedState = JSON.parse(saved);
        // Converti le date da stringhe
        parsedState.sessions = parsedState.sessions.map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          lastActivity: new Date(s.lastActivity),
          gameState: {
            ...s.gameState,
            players: s.gameState.players.map((p: any) => ({
              ...p,
              createdAt: new Date(p.createdAt)
            })),
            actions: s.gameState.actions.map((a: any) => ({
              ...a,
              timestamp: new Date(a.timestamp)
            }))
          }
        }));
        this.sessionsState = parsedState;
      }
    } catch (error) {
      console.error('Errore nel caricamento delle sessioni:', error);
    }
  }

  // Salva le sessioni nel localStorage
  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(this.sessionsState));
    } catch (error) {
      console.error('Errore nel salvataggio delle sessioni:', error);
    }
  }

  // Genera un codice unico di 4 cifre
  private generateUniqueCode(): string {
    let code: string;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      code = Math.floor(1000 + Math.random() * 9000).toString();
      attempts++;
    } while (this.sessionsState.sessions.some(s => s.code === code) && attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      throw new Error('Impossibile generare un codice unico');
    }

    return code;
  }

  // Crea una nuova sessione di gioco
  createSession(name: string): GameSession {
    const code = this.generateUniqueCode();
    const now = new Date();
    
    const newSession: GameSession = {
      id: crypto.randomUUID(),
      code,
      name: name.trim() || `Partita ${code}`,
      createdAt: now,
      lastActivity: now,
      gameState: { players: [], actions: [] }
    };

    this.sessionsState.sessions.push(newSession);
    this.sessionsState.currentSessionId = newSession.id;
    this.saveToStorage();

    return newSession;
  }

  // Trova una sessione per codice
  findSessionByCode(code: string): GameSession | null {
    return this.sessionsState.sessions.find(s => s.code === code) || null;
  }

  // Ottieni una sessione per ID
  getSession(id: string): GameSession | null {
    return this.sessionsState.sessions.find(s => s.id === id) || null;
  }

  // Imposta la sessione corrente
  setCurrentSession(sessionId: string): boolean {
    const session = this.getSession(sessionId);
    if (session) {
      this.sessionsState.currentSessionId = sessionId;
      // Aggiorna last activity
      session.lastActivity = new Date();
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Ottieni la sessione corrente
  getCurrentSession(): GameSession | null {
    if (!this.sessionsState.currentSessionId) return null;
    return this.getSession(this.sessionsState.currentSessionId);
  }

  // Aggiorna lo stato di gioco di una sessione
  updateSessionGameState(sessionId: string, gameState: GameState): boolean {
    const session = this.getSession(sessionId);
    if (session) {
      session.gameState = gameState;
      session.lastActivity = new Date();
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Ottieni tutte le sessioni
  getAllSessions(): GameSession[] {
    return [...this.sessionsState.sessions];
  }

  // Elimina una sessione
  deleteSession(sessionId: string): boolean {
    const index = this.sessionsState.sessions.findIndex(s => s.id === sessionId);
    if (index >= 0) {
      this.sessionsState.sessions.splice(index, 1);
      if (this.sessionsState.currentSessionId === sessionId) {
        this.sessionsState.currentSessionId = undefined;
      }
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Pulisci sessioni vecchie (più di 30 giorni)
  cleanOldSessions(): number {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const initialCount = this.sessionsState.sessions.length;
    this.sessionsState.sessions = this.sessionsState.sessions.filter(
      s => s.lastActivity > thirtyDaysAgo
    );

    const removedCount = initialCount - this.sessionsState.sessions.length;
    if (removedCount > 0) {
      this.saveToStorage();
    }

    return removedCount;
  }
}
