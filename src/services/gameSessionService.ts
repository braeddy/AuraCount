'use client';

import { GameSession, GameSessionsState, GameState, DatabaseGameSession } from '@/types';
import { supabase, isSupabaseReady } from '@/lib/supabase';

const SESSIONS_KEY = 'auracount-game-sessions';

export class GameSessionService {
  private static instance: GameSessionService;
  private sessionsState: GameSessionsState = { sessions: [] };
  private isOnline: boolean = false;

  private constructor() {
    this.checkConnection();
    this.loadSessions();
  }

  static getInstance(): GameSessionService {
    if (!GameSessionService.instance) {
      GameSessionService.instance = new GameSessionService();
    }
    return GameSessionService.instance;
  }

  // Verifica connessione Supabase
  private async checkConnection(): Promise<void> {
    console.log('🔍 GameSession: Verifico connessione Supabase...');
    
    if (!isSupabaseReady) {
      console.log('⚠️ GameSession: Supabase non configurato, modalità localStorage');
      this.isOnline = false;
      return;
    }

    try {
      const { error } = await supabase.from('game_sessions').select('count').limit(1);
      this.isOnline = !error;
      if (this.isOnline) {
        console.log('✅ GameSession: Online - Connesso a Supabase');
      } else {
        console.log('❌ GameSession: Errore Supabase:', error);
        this.isOnline = false;
      }
    } catch (error) {
      console.log('❌ GameSession: Errore di connessione:', error);
      this.isOnline = false;
    }
  }

  // Carica sessioni (da Supabase se online, altrimenti da localStorage)
  private async loadSessions(): Promise<void> {
    console.log('📂 GameSession: Caricamento sessioni...');
    
    if (this.isOnline) {
      try {
        await this.loadFromSupabase();
        console.log('📥 GameSession: Sessioni caricate da Supabase');
      } catch (error) {
        console.error('❌ GameSession: Errore caricamento Supabase, fallback localStorage:', error);
        this.isOnline = false;
        this.loadFromStorage();
      }
    } else {
      console.log('📁 GameSession: Caricamento da localStorage');
      this.loadFromStorage();
    }
  }

  // Carica da Supabase
  private async loadFromSupabase(): Promise<void> {
    const { data, error } = await supabase
      .from('game_sessions')
      .select('*')
      .order('last_activity', { ascending: false });

    if (error) throw error;

    // Converte dal formato database
    const sessions: GameSession[] = (data || []).map(this.convertDatabaseSessionToSession);
    
    this.sessionsState = {
      sessions,
      currentSessionId: this.sessionsState.currentSessionId
    };

    // Salva backup in localStorage
    this.saveToStorage();
  }

  // Carica da localStorage (fallback)
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
      console.error('Errore nel caricamento delle sessioni da localStorage:', error);
    }
  }

  // Salva in localStorage
  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(this.sessionsState));
    } catch (error) {
      console.error('Errore nel salvataggio delle sessioni:', error);
    }
  }

  // Sincronizza con Supabase
  private async syncToSupabase(
    session: GameSession,
    operation: 'insert' | 'update' | 'delete'
  ): Promise<void> {
    if (!this.isOnline || !isSupabaseReady) return;

    try {
      switch (operation) {
        case 'insert':
          const { error: insertError } = await supabase
            .from('game_sessions')
            .insert(this.convertSessionToDatabaseSession(session));
          if (insertError) throw insertError;
          break;

        case 'update':
          const { error: updateError } = await supabase
            .from('game_sessions')
            .update({
              name: session.name,
              last_activity: session.lastActivity.toISOString()
            })
            .eq('id', session.id);
          if (updateError) throw updateError;
          break;

        case 'delete':
          const { error: deleteError } = await supabase
            .from('game_sessions')
            .delete()
            .eq('id', session.id);
          if (deleteError) throw deleteError;
          break;
      }
    } catch (error) {
      console.error(`Errore nella sincronizzazione ${operation} sessione:`, error);
    }
  }

  // Conversioni tra formati
  private convertDatabaseSessionToSession(dbSession: DatabaseGameSession): GameSession {
    return {
      id: dbSession.id,
      code: dbSession.code,
      name: dbSession.name,
      createdAt: new Date(dbSession.created_at),
      lastActivity: new Date(dbSession.last_activity),
      gameState: { players: [], actions: [] } // Le sessioni su Supabase non contengono gameState per ora
    };
  }

  private convertSessionToDatabaseSession(session: GameSession): Omit<DatabaseGameSession, 'id'> {
    return {
      code: session.code,
      name: session.name,
      created_at: session.createdAt.toISOString(),
      last_activity: session.lastActivity.toISOString()
    };
  }

  // Genera un codice univoco di 4 cifre
  private async generateUniqueCode(): Promise<string> {
    let code: string;
    let attempts = 0;
    const maxAttempts = 10;
    
    do {
      code = Math.floor(1000 + Math.random() * 9000).toString();
      attempts++;
      
      // Verifica che non esista localmente
      const localExists = this.sessionsState.sessions.some(s => s.code === code);
      
      // Se siamo online, verifica anche su Supabase
      let remoteExists = false;
      if (this.isOnline) {
        try {
          const { data } = await supabase
            .from('game_sessions')
            .select('id')
            .eq('code', code)
            .single();
          remoteExists = !!data;
        } catch (error) {
          // Errore nella query significa che non esiste
          remoteExists = false;
        }
      }
      
      if (!localExists && !remoteExists) {
        break;
      }
      
    } while (attempts < maxAttempts);
    
    return code;
  }

  // Crea una nuova sessione
  async createSession(name: string): Promise<GameSession> {
    const newSession: GameSession = {
      id: crypto.randomUUID(),
      code: await this.generateUniqueCode(),
      name: name.trim(),
      createdAt: new Date(),
      lastActivity: new Date(),
      gameState: { players: [], actions: [] }
    };

    this.sessionsState.sessions.unshift(newSession);
    this.sessionsState.currentSessionId = newSession.id;
    
    this.saveToStorage();
    await this.syncToSupabase(newSession, 'insert');

    console.log('🎮 GameSession: Sessione creata:', newSession.code);
    return newSession;
  }

  // Trova sessione per codice
  async findSessionByCode(code: string): Promise<GameSession | null> {
    // Prima cerca nelle sessioni locali
    let session = this.sessionsState.sessions.find(s => s.code === code);
    
    // Se non trovata e siamo online, cerca su Supabase
    if (!session && this.isOnline) {
      try {
        const { data, error } = await supabase
          .from('game_sessions')
          .select('*')
          .eq('code', code)
          .single();

        if (!error && data) {
          session = this.convertDatabaseSessionToSession(data);
          // Aggiunge alla cache locale
          this.sessionsState.sessions.push(session);
          this.saveToStorage();
          console.log('🔍 GameSession: Sessione trovata su Supabase:', code);
        }
      } catch (error) {
        console.error('Errore nella ricerca sessione su Supabase:', error);
      }
    }

    return session || null;
  }

  // Unisciti a una sessione
  async joinSession(code: string): Promise<GameSession | null> {
    const session = await this.findSessionByCode(code);
    if (session) {
      this.sessionsState.currentSessionId = session.id;
      // Aggiorna last_activity
      session.lastActivity = new Date();
      await this.syncToSupabase(session, 'update');
      this.saveToStorage();
      console.log('🚪 GameSession: Unito alla sessione:', code);
    } else {
      console.log('❌ GameSession: Sessione non trovata:', code);
    }
    return session;
  }

  // Ottieni sessione corrente
  getCurrentSession(): GameSession | null {
    if (!this.sessionsState.currentSessionId) return null;
    return this.sessionsState.sessions.find(s => s.id === this.sessionsState.currentSessionId) || null;
  }

  // Aggiorna gameState di una sessione (solo locale)
  updateSessionGameState(sessionId: string, gameState: GameState): void {
    const session = this.sessionsState.sessions.find(s => s.id === sessionId);
    if (session) {
      session.gameState = gameState;
      session.lastActivity = new Date();
      this.saveToStorage();
    }
  }

  // Elimina una sessione
  async deleteSession(sessionId: string): Promise<boolean> {
    const sessionIndex = this.sessionsState.sessions.findIndex(s => s.id === sessionId);
    if (sessionIndex === -1) return false;

    const session = this.sessionsState.sessions[sessionIndex];
    this.sessionsState.sessions.splice(sessionIndex, 1);
    
    if (this.sessionsState.currentSessionId === sessionId) {
      this.sessionsState.currentSessionId = undefined;
    }
    
    this.saveToStorage();
    await this.syncToSupabase(session, 'delete');
    
    console.log('🗑️ GameSession: Sessione eliminata:', session.code);
    return true;
  }

  // Ottieni tutte le sessioni
  getAllSessions(): GameSession[] {
    return this.sessionsState.sessions;
  }

  // Pulisci sessioni vecchie (più di 7 giorni)
  async cleanOldSessions(): Promise<void> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const oldSessions = this.sessionsState.sessions.filter(s => s.lastActivity < sevenDaysAgo);
    
    for (const session of oldSessions) {
      await this.deleteSession(session.id);
    }
    
    if (oldSessions.length > 0) {
      console.log(`🧹 GameSession: Eliminate ${oldSessions.length} sessioni vecchie`);
    }
  }

  // Forza ricaricamento da Supabase
  async refresh(): Promise<void> {
    await this.checkConnection();
    if (this.isOnline) {
      await this.loadFromSupabase();
    }
  }

  // Verifica se siamo online
  isConnected(): boolean {
    return this.isOnline;
  }
}
