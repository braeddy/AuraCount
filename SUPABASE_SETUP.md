# Setup Database Supabase per AuraCount

## Prerequisiti

1. **Crea un account Supabase**
   - Vai su [supabase.com](https://supabase.com)
   - Crea un nuovo progetto
   - Nome: `AuraCount` (o come preferisci)
   - Regione: Europe West (consigliata per l'Italia)

2. **Ottieni le credenziali**
   - Dalla dashboard del progetto, vai su Settings > API
   - Copia:
     - `Project URL` (formato: https://your-project-id.supabase.co)
     - `anon public key`

## Configurazione

### 1. Variabili d'ambiente per sviluppo locale

Aggiorna il file `.env.local` nella root del progetto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**⚠️ Importante**: Sostituisci `your-project-id` e `your_supabase_anon_key` con i valori reali dal tuo progetto Supabase.

### 2. Configurazione per Vercel (Deployment)

Quando fai il deploy su Vercel, aggiungi le variabili d'ambiente:

1. **Durante il setup iniziale di Vercel:**
   - Nella sezione "Environment Variables" aggiungi:
     - `NEXT_PUBLIC_SUPABASE_URL` = `https://your-project-id.supabase.co`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your_supabase_anon_key`

2. **Per progetti già deployati:**
   - Vai al dashboard Vercel del tuo progetto
   - Settings > Environment Variables
   - Aggiungi le variabili sopra
   - Rideploya il progetto

### 3. Creazione delle tabelle

1. Vai alla sezione **SQL Editor** nel tuo progetto Supabase
2. Copia e incolla il contenuto del file `database/schema.sql`
3. Clicca "Run" per eseguire lo script e creare le tabelle

### 4. Test della connessione

**In locale:**
1. Riavvia il server di sviluppo: `npm run dev`
2. Apri l'app nel browser
3. Controlla la console del browser per il messaggio "Online" 

**Su Vercel:**
1. Dopo il deploy, apri l'URL dell'app
2. Controlla la console del browser per verificare la connessione

## Funzionalità

### Modalità Ibrida

Il database implementa una modalità ibrida che:

- **Online**: Usa Supabase quando disponibile
- **Offline**: Fallback a localStorage quando Supabase non è raggiungibile
- **Sincronizzazione**: Sincronizza automaticamente con Supabase quando possibile

### Gestione Errori

- Se Supabase non è disponibile, l'app continua a funzionare con localStorage
- I dati vengono sempre salvati localmente come backup
- La sincronizzazione avviene automaticamente quando la connessione si ripristina

### Migrazione Dati

Se hai già dati in localStorage:

1. L'app caricherà automaticamente i dati esistenti
2. I dati verranno sincronizzati con Supabase al primo avvio
3. Il backup locale viene mantenuto per sicurezza

## API del Database

### Hook useDatabase

```typescript
import { useDatabase } from '@/hooks/useDatabase';

function MyComponent() {
  const {
    isLoading,
    isConnected,
    players,
    actions,
    sortedPlayers,
    addPlayer,
    updatePlayer,
    removePlayer,
    changeAura,
    resetGame,
    refreshData
  } = useDatabase();

  // Uso normale...
}
```

### Metodi Principali

```typescript
// Aggiungi giocatore
const player = await addPlayer('Nome Giocatore');

// Aggiorna giocatore  
const updated = await updatePlayer(playerId, { bio: 'Nuova bio' });

// Cambia aura
const success = await changeAura(playerId, 10, 'Motivo del cambio');

// Rimuovi giocatore
const removed = await removePlayer(playerId);

// Reset completo
await resetGame();

// Forza ricaricamento da database
await refreshData();
```

## Struttura Database

### Tabella `players`
- `id`: UUID (Primary Key)
- `name`: VARCHAR(255) (Nome giocatore)
- `aura`: INTEGER (Punteggio aura)
- `created_at`: TIMESTAMP (Data creazione)
- `profile_image`: TEXT (Immagine profilo)
- `bio`: TEXT (Biografia)

### Tabella `aura_actions`
- `id`: UUID (Primary Key)
- `player_id`: UUID (Foreign Key -> players.id)
- `player_name`: VARCHAR(255) (Nome giocatore al momento dell'azione)
- `change`: INTEGER (Variazione aura)
- `timestamp`: TIMESTAMP (Data/ora azione)
- `reason`: TEXT (Motivo del cambio)

### Tabella `game_sessions` (per il futuro)
- `id`: UUID (Primary Key)
- `code`: VARCHAR(4) (Codice sessione)
- `name`: VARCHAR(255) (Nome sessione)
- `created_at`: TIMESTAMP (Data creazione)
- `last_activity`: TIMESTAMP (Ultima attività)

## Sicurezza

- Le tabelle sono configurate per accesso pubblico (per ora)
- In futuro si può implementare Row Level Security (RLS)
- Le chiavi API sono public (safe per frontend)

## Performance

- Indici ottimizzati per query comuni
- Limite di 1000 azioni mantenute in memoria
- Cache locale per ridurre chiamate al database

## Troubleshooting

### Errore di connessione
- Verifica le variabili d'ambiente
- Controlla che il progetto Supabase sia attivo
- L'app funzionerà comunque in modalità offline

### Dati non sincronizzati
- Usa `refreshData()` per forzare il ricaricamento
- Controlla la console per errori di rete

### Reset completo
Se qualcosa va storto:
1. `localStorage.clear()` nel browser
2. Truncate delle tabelle in Supabase
3. Riavvia l'app
