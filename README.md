# 🎮 AuraCount - Traccia l'Aura dei Tuoi Amici

Una webapp moderna e interattiva per tracciare i punti "aura" dei tuoi amici in un gioco divertente!

## ✨ Funzionalità Principali

### 🏠 Dashboard Principale
- **Leaderboard dinamica** con classifica in tempo reale
- **Card giocatori interattive** con foto profilo
- **Controlli rapidi** per modificare l'aura (+1, +5, -1, -5, personalizzato)
- **Aggiunta/rimozione giocatori** con validazione
- **Storico azioni globale** nella sidebar

### 👤 Profili Giocatori Dettagliati
- **Pagina dedicata** per ogni giocatore (click sulla card)
- **Upload foto profilo** (max 5MB, JPG/PNG/GIF)
- **Modifica nome e biografia** del giocatore
- **Statistiche complete**:
  - Azioni totali, positive e negative
  - Aura guadagnata/persa e netta
  - Media aura per giorno
  - Record personali (maggior guadagno/perdita)
- **Storico personalizzato** raggruppato per data
- **Controlli rapidi** specifici per il giocatore

### 💾 Database Locale Avanzato
- **Persistenza automatica** nel localStorage
- **Sistema di backup** per sicurezza dati
- **Gestione errori** con recovery automatico
- **Export/Import** dei dati (JSON)
- **Ottimizzazioni prestazioni** (max 1000 azioni salvate)
- **💾 Salvataggio Automatico**: I dati vengono salvati automaticamente nel browser
- **📱 Design Responsive**: Funziona perfettamente su desktop e mobile
- **🎨 UI Moderna**: Interfaccia elegante con gradienti e effetti blur

## 🚀 Come Iniziare

### Prerequisiti

Assicurati di avere installato:
- [Node.js](https://nodejs.org/) (versione 18 o superiore)
- npm, yarn, pnpm o bun

### Installazione

1. **Installa le dipendenze**:
   ```bash
   npm install
   # oppure
   yarn install
   # oppure
   pnpm install
   # oppure
   bun install
   ```

2. **Avvia il server di sviluppo**:
   ```bash
   npm run dev
   # oppure
   yarn dev
   # oppure
   pnpm dev
   # oppure
   bun dev
   ```

3. **Apri il browser**: Vai su [http://localhost:3000](http://localhost:3000) per vedere l'app in azione!

## 🎯 Come Usare AuraCount

### 1. Aggiungi Giocatori
- Inserisci il nome del giocatore nel campo "Nome del giocatore"
- Clicca su "✨ Aggiungi al Gioco"
- Il giocatore apparirà nella lista con 0 punti aura

### 2. Modifica l'Aura
- **Pulsanti Veloci**: Usa i pulsanti +1, +5, -1, -5 per modifiche rapide
- **Valore Personalizzato**: Clicca su "🎯 Personalizzato" per inserire un valore specifico
- **Aggiungi Motivo**: Inserisci una ragione opzionale per la modifica

### 3. Visualizza la Classifica
- I giocatori sono automaticamente ordinati per punti aura (dal più alto al più basso)
- Il primo classificato ha la corona 👑
- Il secondo e terzo hanno le medaglie 🥈🥉

### 4. Controlla lo Storico
- Tutte le azioni sono registrate con timestamp
- Visualizza chi ha guadagnato/perso aura e quando
- Include i motivi se specificati

### 5. Gestisci il Gioco
- **Rimuovi Giocatori**: Clicca sull'icona del cestino per rimuovere un giocatore
- **Reset Gioco**: Usa il pulsante "🔄 Reset Gioco" per ricominciare da capo

## 🛠️ Tecnologie Utilizzate

- **[Next.js 14](https://nextjs.org/)** - Framework React con App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety e miglior developer experience
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling moderno e responsive
- **[React Hooks](https://react.dev/reference/react)** - Gestione stato con useState e useEffect
- **LocalStorage** - Persistenza dati nel browser

## 📁 Struttura del Progetto

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Layout principale
│   ├── page.tsx           # Homepage
│   └── globals.css        # Stili globali
├── components/            # Componenti React
│   ├── Header.tsx         # Intestazione dell'app
│   ├── AddPlayerForm.tsx  # Form per aggiungere giocatori
│   ├── PlayerCard.tsx     # Card del singolo giocatore
│   └── ActionHistory.tsx  # Storico delle azioni
├── hooks/                 # Custom React Hooks
│   └── useGameState.ts    # Gestione stato del gioco
└── types/                 # Definizioni TypeScript
    └── index.ts           # Tipi del gioco
```

## 🎨 Personalizzazione

### Modifica i Colori
I colori sono definiti in `src/app/globals.css` e possono essere personalizzati modificando le variabili CSS:

```css
:root {
  --background: #ffffff;
  --foreground: #171717;
}
```

### Aggiungi Nuove Funzionalità
Il progetto è strutturato in modo modulare. Puoi facilmente:
- Aggiungere nuovi componenti in `src/components/`
- Estendere i tipi in `src/types/index.ts`
- Modificare la logica di gioco in `src/hooks/useGameState.ts`

## 🚀 Build e Deploy

### Build per Produzione
```bash
npm run build
npm start
```

### Deploy
L'app può essere facilmente deploiata su:
- [Vercel](https://vercel.com/) (raccomandato per Next.js)
- [Netlify](https://netlify.com/)
- [Heroku](https://heroku.com/)
- Qualsiasi servizio che supporti Node.js

## 🤝 Contribuire

Se hai idee per migliorare AuraCount:
1. Fai un fork del progetto
2. Crea un branch per la tua feature
3. Committa le tue modifiche
4. Apri una Pull Request

## 📝 Licenza

Questo progetto è open source e disponibile sotto la [MIT License](LICENSE).

## 🎮 Buon Divertimento!

Divertiti a tracciare l'aura dei tuoi amici e che vinca il migliore! ✨

---

*Creato con ❤️ per il divertimento tra amici*
#   A u r a C o u n t  
 