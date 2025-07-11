# Guida Deployment su Vercel

## Prerequisiti Completati

✅ Supabase configurato e tabelle create  
✅ Database ibrido implementato (funziona online/offline)  
✅ Variabili d'ambiente configurate localmente  

## Deployment su Vercel

### Metodo 1: Deployment diretto (Raccomandato)

1. **Push del codice su GitHub:**
   ```bash
   git add .
   git commit -m "Add Supabase database integration"
   git push origin main
   ```

2. **Collegamento a Vercel:**
   - Vai su [vercel.com](https://vercel.com)
   - Fai login con GitHub
   - Clicca "New Project"
   - Seleziona il repository `AuraCount`
   - **Importante**: Prima di deployare, aggiungi le Environment Variables

3. **Configurazione Environment Variables:**
   - Nella sezione "Environment Variables" prima del deploy:
   - Aggiungi:
     - `NEXT_PUBLIC_SUPABASE_URL` = `https://your-project-id.supabase.co`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your-actual-anon-key`
   - Clicca "Deploy"

### Metodo 2: Deploy tramite CLI

1. **Installa Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login e deploy:**
   ```bash
   vercel login
   vercel
   ```

3. **Configurazione durante il setup:**
   - Segui le istruzioni
   - Quando richiesto, aggiungi le environment variables

### Metodo 3: Deploy per progetti già esistenti

Se hai già deployato il progetto su Vercel senza Supabase:

1. **Vai al dashboard Vercel**
2. **Settings > Environment Variables**
3. **Aggiungi le variabili:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Redeploy:**
   - Vai a "Deployments"
   - Clicca sui tre puntini dell'ultimo deployment
   - "Redeploy"

## Verifica del Deployment

Dopo il deployment:

1. **Apri l'URL dell'app**
2. **Controlla la console del browser:**
   - Dovrebbe mostrare "Online" se Supabase è configurato correttamente
   - Se mostra "Offline", verifica le environment variables
3. **Testa le funzionalità:**
   - Aggiungi un giocatore
   - Modifica l'aura
   - Verifica che i dati persistano dopo refresh

## Troubleshooting

### ❌ App mostra "Offline" su Vercel

**Causa:** Environment variables non configurate correttamente

**Soluzione:**
1. Verifica che le variabili siano state aggiunte su Vercel
2. Controlla che i valori siano corretti (senza spazi)
3. Redeploya dopo aver aggiunto/modificato le variabili

### ❌ Build fallisce

**Causa:** Variabili d'ambiente mancanti durante la build

**Soluzione:**
- Le nostre modifiche gestiscono questo caso
- L'app compilerà comunque e funzionerà in modalità localStorage

### ❌ Dati non si salvano

**Causa:** Problema di connessione a Supabase

**Soluzione:**
1. Verifica che il progetto Supabase sia attivo
2. Controlla le credenziali nell'interfaccia Supabase
3. L'app funzionerà comunque salvando localmente

## URL e Domini

### URL temporaneo Vercel
Vercel assegnerà un URL del tipo:
`https://aura-count-xyz123.vercel.app`

### Dominio personalizzato (Opzionale)
1. **Acquista un dominio** (es. su Namecheap, GoDaddy)
2. **In Vercel:** Settings > Domains
3. **Aggiungi il dominio** e configura i DNS

## Monitoraggio

### Analytics Vercel
- Vai al dashboard del progetto
- Sezione "Analytics" per vedere traffico e performance

### Logs Supabase  
- Dashboard Supabase > Logs
- Monitora le query al database

### Console Browser
- Sempre disponibile per debug in tempo reale

## Sicurezza in Produzione

### Attuale (Sufficiente per iniziare)
✅ Chiavi API pubbliche (safe per frontend)  
✅ Accesso pubblico alle tabelle  
✅ HTTPS automatico su Vercel  

### Future (Per app più grandi)
- Row Level Security (RLS) su Supabase
- Autenticazione utenti
- Rate limiting

## Prossimi Passi

1. **Deploy l'app** seguendo i metodi sopra
2. **Testa tutto** nell'ambiente di produzione  
3. **Condividi l'URL** con gli amici per testare
4. **Monitora** l'uso e le performance

L'app è pronta per l'uso in produzione! 🚀
