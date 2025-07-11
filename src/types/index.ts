export interface Player {
  id: string;
  name: string;
  aura: number;
  createdAt: Date;
  profileImage?: string; // Base64 o URL dell'immagine
  bio?: string; // Breve biografia del giocatore
}

export interface AuraAction {
  id: string;
  playerId: string;
  playerName: string;
  change: number;
  timestamp: Date;
  reason?: string;
}

export interface GameState {
  players: Player[];
  actions: AuraAction[];
}

// Nuovi tipi per le partite multiple
export interface GameSession {
  id: string;
  code: string; // Codice di 4 cifre
  name: string;
  createdAt: Date;
  lastActivity: Date;
  gameState: GameState;
}

export interface GameSessionsState {
  sessions: GameSession[];
  currentSessionId?: string;
}

// Tipi per la conversione tra database e frontend
export interface DatabasePlayer {
  id: string;
  name: string;
  aura: number;
  created_at: string;
  profile_image: string | null;
  bio: string | null;
}

export interface DatabaseAuraAction {
  id: string;
  player_id: string;
  player_name: string;
  change: number;
  timestamp: string;
  reason: string | null;
}

export interface DatabaseGameSession {
  id: string;
  code: string;
  name: string;
  created_at: string;
  last_activity: string;
}
