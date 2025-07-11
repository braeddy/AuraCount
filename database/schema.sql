-- Creazione della tabella players
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    aura INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    profile_image TEXT,
    bio TEXT,
    
    -- Constraints
    CONSTRAINT players_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT players_aura_reasonable CHECK (aura >= -999999 AND aura <= 999999)
);

-- Creazione della tabella aura_actions
CREATE TABLE IF NOT EXISTS aura_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    player_name VARCHAR(255) NOT NULL,
    change INTEGER NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reason TEXT,
    
    -- Constraints
    CONSTRAINT aura_actions_change_not_zero CHECK (change != 0),
    CONSTRAINT aura_actions_change_reasonable CHECK (change >= -1000 AND change <= 1000)
);

-- Creazione della tabella game_sessions (per il futuro)
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(4) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT game_sessions_code_format CHECK (code ~ '^[0-9]{4}$'),
    CONSTRAINT game_sessions_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

-- Indici per migliorare le performance
CREATE INDEX IF NOT EXISTS idx_players_name ON players(name);
CREATE INDEX IF NOT EXISTS idx_players_aura ON players(aura DESC);
CREATE INDEX IF NOT EXISTS idx_players_created_at ON players(created_at);

CREATE INDEX IF NOT EXISTS idx_aura_actions_player_id ON aura_actions(player_id);
CREATE INDEX IF NOT EXISTS idx_aura_actions_timestamp ON aura_actions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_aura_actions_player_timestamp ON aura_actions(player_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_game_sessions_code ON game_sessions(code);
CREATE INDEX IF NOT EXISTS idx_game_sessions_last_activity ON game_sessions(last_activity DESC);

-- Trigger per aggiornare last_activity nelle sessioni
CREATE OR REPLACE FUNCTION update_last_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE game_sessions 
    SET last_activity = NOW() 
    WHERE id = NEW.session_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Politiche RLS (Row Level Security) - opzionale per ora
-- ALTER TABLE players ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE aura_actions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Politiche per accesso pubblico (per ora)
-- CREATE POLICY "Public access" ON players FOR ALL USING (true);
-- CREATE POLICY "Public access" ON aura_actions FOR ALL USING (true);
-- CREATE POLICY "Public access" ON game_sessions FOR ALL USING (true);

-- Commenti sulle tabelle
COMMENT ON TABLE players IS 'Tabella dei giocatori che partecipano al gioco dell''aura';
COMMENT ON TABLE aura_actions IS 'Storico delle azioni che modificano l''aura dei giocatori';
COMMENT ON TABLE game_sessions IS 'Sessioni di gioco multiple per supportare partite separate';

COMMENT ON COLUMN players.aura IS 'Punteggio aura attuale del giocatore';
COMMENT ON COLUMN players.profile_image IS 'Immagine del profilo in base64 o URL';
COMMENT ON COLUMN players.bio IS 'Biografia breve del giocatore';

COMMENT ON COLUMN aura_actions.change IS 'Variazione dell''aura (può essere positiva o negativa)';
COMMENT ON COLUMN aura_actions.reason IS 'Motivo della variazione dell''aura';

COMMENT ON COLUMN game_sessions.code IS 'Codice numerico di 4 cifre per identificare la sessione';
COMMENT ON COLUMN game_sessions.last_activity IS 'Timestamp dell''ultima attività nella sessione';
