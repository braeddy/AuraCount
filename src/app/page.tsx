'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GameSessionService } from '@/services/gameSessionService';

export default function LandingPage() {
  const router = useRouter();
  const [gameSessionService] = useState(() => GameSessionService.getInstance());
  
  // Stati per creare partita
  const [gameName, setGameName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  // Stati per accedere a partita
  const [gameCode, setGameCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  const handleCreateGame = async () => {
    if (isCreating) return;
    
    setIsCreating(true);
    try {
      const session = gameSessionService.createSession(gameName);
      
      // Naviga direttamente alla pagina di gioco
      router.push('/game');
    } catch (error) {
      console.error('Errore nella creazione della partita:', error);
      alert('Errore nella creazione della partita. Riprova.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGame = () => {
    if (isJoining) return;
    
    const code = gameCode.trim();
    if (code.length !== 4 || !/^\d{4}$/.test(code)) {
      setJoinError('Il codice deve essere di 4 cifre');
      return;
    }

    setIsJoining(true);
    setJoinError('');

    try {
      const session = gameSessionService.findSessionByCode(code);
      if (!session) {
        setJoinError('Codice partita non trovato');
        setIsJoining(false);
        return;
      }

      // Imposta come sessione corrente
      gameSessionService.setCurrentSession(session.id);
      
      // Naviga alla pagina di gioco
      router.push('/game');
    } catch (error) {
      console.error('Errore nell\'accesso alla partita:', error);
      setJoinError('Errore nell\'accesso alla partita');
      setIsJoining(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setGameCode(value);
    setJoinError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-6xl font-extralight text-slate-800 mb-4 tracking-tight">
            AuraCount
          </h1>
          <p className="text-slate-500 text-lg font-light">
            Traccia l&apos;aura dei tuoi amici
          </p>
        </div>

        {/* Azioni principali */}
        <div className="space-y-6">
          {/* Crea partita */}
          <div className="glass-card rounded-3xl p-6">
            <h2 className="text-2xl font-semibold text-slate-800 mb-4 text-center">
              Crea Nuova Partita
            </h2>
            
            <div className="space-y-4">
              <input
                type="text"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                placeholder="Nome partita (opzionale)"
                className="w-full px-4 py-3 rounded-2xl bg-white/80 text-slate-700 placeholder-slate-400 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 font-medium"
                maxLength={30}
              />
              
              <button
                onClick={handleCreateGame}
                disabled={isCreating}
                className="w-full bg-gradient-to-r from-emerald-100 to-cyan-100 hover:from-emerald-200 hover:to-cyan-200 disabled:from-slate-200 disabled:to-slate-300 text-slate-700 disabled:text-slate-400 font-medium py-3 px-6 rounded-2xl transition-all duration-200 border border-emerald-200 disabled:border-slate-200"
              >
                {isCreating ? 'Creazione...' : 'Crea Partita'}
              </button>
            </div>
            
            <div className="mt-4 text-center text-slate-500 text-sm">
              Riceverai un codice di 4 cifre da condividere
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center">
            <div className="border-t border-slate-200 flex-1"></div>
            <span className="px-4 text-slate-400 text-sm font-medium">oppure</span>
            <div className="border-t border-slate-200 flex-1"></div>
          </div>

          {/* Accedi a partita */}
          <div className="glass-card rounded-3xl p-6">
            <h2 className="text-2xl font-semibold text-slate-800 mb-4 text-center">
              Accedi a Partita
            </h2>
            
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={gameCode}
                  onChange={handleCodeChange}
                  placeholder="Codice partita (4 cifre)"
                  className={`w-full px-4 py-3 rounded-2xl bg-white/80 text-slate-700 placeholder-slate-400 border font-medium text-center text-2xl tracking-widest ${
                    joinError 
                      ? 'border-rose-300 focus:ring-rose-300' 
                      : 'border-slate-200 focus:ring-indigo-300'
                  } focus:outline-none focus:ring-2`}
                  maxLength={4}
                />
                {joinError && (
                  <p className="text-rose-600 text-sm mt-2 text-center">
                    {joinError}
                  </p>
                )}
              </div>
              
              <button
                onClick={handleJoinGame}
                disabled={isJoining || gameCode.length !== 4}
                className="w-full bg-gradient-to-r from-teal-100 to-blue-100 hover:from-teal-200 hover:to-blue-200 disabled:from-slate-200 disabled:to-slate-300 text-slate-700 disabled:text-slate-400 font-medium py-3 px-6 rounded-2xl transition-all duration-200 border border-teal-200 disabled:border-slate-200"
              >
                {isJoining ? 'Accesso...' : 'Accedi alla Partita'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-slate-400 text-sm">
          <p>I codici partita sono composti da 4 cifre</p>
          <p className="mt-1">Le partite vengono salvate automaticamente</p>
        </div>
      </div>
    </div>
  );
}
