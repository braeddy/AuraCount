-- Script per permettere valori infiniti di aura su Supabase
-- Esegui questo nel SQL Editor di Supabase

-- 1. Rimuovi tutti i constraints limitanti sui valori
ALTER TABLE aura_actions DROP CONSTRAINT IF EXISTS aura_actions_change_reasonable;
ALTER TABLE players DROP CONSTRAINT IF EXISTS players_aura_reasonable;

-- 2. Mantieni solo i constraints essenziali (non zero per le azioni)
ALTER TABLE aura_actions 
ADD CONSTRAINT aura_actions_change_not_zero 
CHECK (change != 0);

-- 3. Verifica che i constraints siano stati aggiornati
SELECT 
    conname as constraint_name,
    conrelid::regclass as table_name,
    consrc as constraint_definition
FROM pg_constraint 
WHERE conrelid IN (
    SELECT oid FROM pg_class WHERE relname IN ('aura_actions', 'players')
) 
AND contype = 'c'
ORDER BY table_name, constraint_name;
