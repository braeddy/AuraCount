'use client';

import { supabase, isSupabaseReady } from '@/lib/supabase';
import { 
  Player, 
  AuraAction, 
  GameState, 
  DatabasePlayer, 
  DatabaseAuraAction 
} from '@/types';

const STORAGE_KEY = 'auracount-game-state';
const BACKUP_KEY = 'auracount-backup';

export class DatabaseService {
  private static instance: DatabaseService;
  private gameState: GameState = { players: [], actions: [] };
  private isOnline: boolean = true;

  private constructor() {
    this.checkConnection();
    this.loadData();
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Verifica se Supabase è disponibile
  private async checkConnection(): Promise<void> {
    if (!isSupabaseReady) {
      console.warn('Supabase non configurato, modalità localStorage');
      this.isOnline = false;
      return;
    }

    try {
      const { error } = await supabase.from('players').select('count').limit(1);
      this.isOnline = !error;
    } catch (error) {
      console.warn('Supabase non disponibile, modalità offline:', error);
      this.isOnline = false;
    }
  }

  // Carica i dati (da Supabase se online, altrimenti da localStorage)
  private async loadData(): Promise<void> {
    if (this.isOnline) {
      try {
        await this.loadFromSupabase();
      } catch (error) {
        console.error('Errore nel caricamento da Supabase, fallback a localStorage:', error);
        this.isOnline = false;
        this.loadFromStorage();
      }
    } else {
      this.loadFromStorage();
    }
  }

  // Carica dati da Supabase
  private async loadFromSupabase(): Promise<void> {
    try {
      // Carica i giocatori
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('*')
        .order('created_at', { ascending: true });

      if (playersError) throw playersError;

      // Carica le azioni
      const { data: actionsData, error: actionsError } = await supabase
        .from('aura_actions')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1000);

      if (actionsError) throw actionsError;

      // Converte i dati dal formato database al formato frontend
      this.gameState = {
        players: (playersData || []).map(this.convertDatabasePlayerToPlayer),
        actions: (actionsData || []).map(this.convertDatabaseActionToAction)
      };

      // Salva anche in localStorage come backup
      this.saveToStorage();
    } catch (error) {
      console.error('Errore nel caricamento da Supabase:', error);
      throw error;
    }
  }

  // Carica dati da localStorage (fallback)
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
      console.error('Errore nel caricamento dei dati da localStorage:', error);
      this.loadBackup();
    }
  }

  // Salva dati in localStorage
  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.gameState));
      localStorage.setItem(BACKUP_KEY, JSON.stringify(this.gameState));
    } catch (error) {
      console.error('Errore nel salvataggio in localStorage:', error);
    }
  }

  // Carica il backup da localStorage
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

  // Funzioni di conversione tra formati database e frontend
  private convertDatabasePlayerToPlayer(dbPlayer: DatabasePlayer): Player {
    return {
      id: dbPlayer.id,
      name: dbPlayer.name,
      aura: dbPlayer.aura,
      createdAt: new Date(dbPlayer.created_at),
      profileImage: dbPlayer.profile_image || undefined,
      bio: dbPlayer.bio || undefined
    };
  }

  private convertPlayerToDatabasePlayer(player: Player): Omit<DatabasePlayer, 'id'> {
    return {
      name: player.name,
      aura: player.aura,
      created_at: player.createdAt.toISOString(),
      profile_image: player.profileImage || null,
      bio: player.bio || null
    };
  }

  private convertDatabaseActionToAction(dbAction: DatabaseAuraAction): AuraAction {
    return {
      id: dbAction.id,
      playerId: dbAction.player_id,
      playerName: dbAction.player_name,
      change: dbAction.change,
      timestamp: new Date(dbAction.timestamp),
      reason: dbAction.reason || undefined
    };
  }

  private convertActionToDatabaseAction(action: AuraAction): Omit<DatabaseAuraAction, 'id'> {
    return {
      player_id: action.playerId,
      player_name: action.playerName,
      change: action.change,
      timestamp: action.timestamp.toISOString(),
      reason: action.reason || null
    };
  }

  // Sincronizza con Supabase (se online)
  private async syncToSupabase<T>(
    table: string,
    data: T,
    operation: 'insert' | 'update' | 'delete',
    id?: string
  ): Promise<void> {
    if (!this.isOnline || !isSupabaseReady) return;

    try {
      switch (operation) {
        case 'insert':
          const { error: insertError } = await supabase
            .from(table)
            .insert(data);
          if (insertError) throw insertError;
          break;

        case 'update':
          if (!id) throw new Error('ID richiesto per update');
          const { error: updateError } = await supabase
            .from(table)
            .update(data)
            .eq('id', id);
          if (updateError) throw updateError;
          break;

        case 'delete':
          if (!id) throw new Error('ID richiesto per delete');
          const { error: deleteError } = await supabase
            .from(table)
            .delete()
            .eq('id', id);
          if (deleteError) throw deleteError;
          break;
      }
    } catch (error) {
      console.error(`Errore nella sincronizzazione ${operation} su ${table}:`, error);
      // In caso di errore, continua con localStorage
      this.isOnline = false;
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
  async addPlayer(name: string): Promise<Player> {
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name: name.trim(),
      aura: 0,
      createdAt: new Date(),
      bio: ''
    };

    // Aggiungi al state locale
    this.gameState.players.push(newPlayer);
    this.saveToStorage();

    // Sincronizza con Supabase
    await this.syncToSupabase(
      'players',
      this.convertPlayerToDatabasePlayer(newPlayer),
      'insert'
    );

    return newPlayer;
  }

  // Aggiorna un giocatore
  async updatePlayer(id: string, updates: Partial<Player>): Promise<Player | null> {
    const playerIndex = this.gameState.players.findIndex(p => p.id === id);
    if (playerIndex === -1) return null;

    const updatedPlayer = {
      ...this.gameState.players[playerIndex],
      ...updates
    };

    this.gameState.players[playerIndex] = updatedPlayer;
    this.saveToStorage();

    // Sincronizza con Supabase
    await this.syncToSupabase(
      'players',
      this.convertPlayerToDatabasePlayer(updatedPlayer),
      'update',
      id
    );

    return updatedPlayer;
  }

  // Rimuovi un giocatore
  async removePlayer(id: string): Promise<boolean> {
    const initialLength = this.gameState.players.length;
    this.gameState.players = this.gameState.players.filter(p => p.id !== id);
    this.gameState.actions = this.gameState.actions.filter(a => a.playerId !== id);
    
    if (this.gameState.players.length < initialLength) {
      this.saveToStorage();

      // Sincronizza con Supabase
      await this.syncToSupabase('players', null, 'delete', id);
      
      // Rimuovi anche le azioni correlate da Supabase
      if (this.isOnline) {
        try {
          await supabase
            .from('aura_actions')
            .delete()
            .eq('player_id', id);
        } catch (error) {
          console.error('Errore nella rimozione delle azioni del giocatore:', error);
        }
      }

      return true;
    }
    return false;
  }

  // Cambia aura di un giocatore
  async changeAura(playerId: string, change: number, reason?: string): Promise<boolean> {
    const player = this.getPlayer(playerId);
    if (!player) return false;

    // Aggiorna l'aura del giocatore
    await this.updatePlayer(playerId, { aura: player.aura + change });

    // Aggiungi l'azione allo storico
    const action: AuraAction = {
      id: crypto.randomUUID(),
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

    // Sincronizza con Supabase
    await this.syncToSupabase(
      'aura_actions',
      this.convertActionToDatabaseAction(action),
      'insert'
    );

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
  async resetGame(): Promise<void> {
    this.gameState = { players: [], actions: [] };
    this.saveToStorage();

    // Reset anche su Supabase
    if (this.isOnline) {
      try {
        await supabase.from('aura_actions').delete().neq('id', '');
        await supabase.from('players').delete().neq('id', '');
      } catch (error) {
        console.error('Errore nel reset del database:', error);
      }
    }
  }

  // Esporta i dati
  exportData(): string {
    return JSON.stringify(this.gameState, null, 2);
  }

  // Importa i dati
  async importData(data: string): Promise<boolean> {
    try {
      const imported = JSON.parse(data);
      if (imported.players && imported.actions) {
        // Reset prima dell'import
        await this.resetGame();

        // Importa i giocatori
        for (const player of imported.players) {
          const playerData: Player = {
            ...player,
            createdAt: new Date(player.createdAt)
          };
          this.gameState.players.push(playerData);
          
          // Sincronizza con Supabase
          await this.syncToSupabase(
            'players',
            this.convertPlayerToDatabasePlayer(playerData),
            'insert'
          );
        }

        // Importa le azioni
        for (const action of imported.actions) {
          const actionData: AuraAction = {
            ...action,
            timestamp: new Date(action.timestamp)
          };
          this.gameState.actions.push(actionData);
          
          // Sincronizza con Supabase
          await this.syncToSupabase(
            'aura_actions',
            this.convertActionToDatabaseAction(actionData),
            'insert'
          );
        }

        this.saveToStorage();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Errore nell\'importazione:', error);
      return false;
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
