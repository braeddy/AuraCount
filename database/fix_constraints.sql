-- Script semplificato per rimuovere solo i constraints limitanti
-- Esegui questo nel SQL Editor di Supabase

-- Rimuovi i constraints che limitano i valori
ALTER TABLE aura_actions DROP CONSTRAINT IF EXISTS aura_actions_change_reasonable;
ALTER TABLE players DROP CONSTRAINT IF EXISTS players_aura_reasonable;

-- Cambia il tipo di colonna per supportare valori enormi (da INTEGER a BIGINT)
ALTER TABLE players ALTER COLUMN aura TYPE BIGINT;
ALTER TABLE aura_actions ALTER COLUMN change_amount TYPE BIGINT;

-- Verifica i constraints rimasti
SELECT 
    conname as constraint_name,
    conrelid::regclass as table_name
FROM pg_constraint 
WHERE conrelid IN (
    SELECT oid FROM pg_class WHERE relname IN ('aura_actions', 'players')
) 
AND contype = 'c'
ORDER BY table_name, constraint_name;
