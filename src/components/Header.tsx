import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { GameSessionService } from '@/services/gameSessionService';
import ConfirmModal from './ConfirmModal';
import DatabaseStatus from './DatabaseStatus';

interface HeaderProps {
  playersCount: number;
  onToggleHistory: () => void;
  onResetGame: () => void;
  showHistory: boolean;
  // Nuove props per il database status
  isLoading?: boolean;
  isConnected?: boolean;
}

export default function Header({ playersCount, onToggleHistory, onResetGame, showHistory, isLoading, isConnected }: HeaderProps) {
  const router = useRouter();
  const sessionService = GameSessionService.getInstance();
  const currentSession = sessionService.getCurrentSession();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleDeleteGame = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteGame = async () => {
    if (!currentSession) return;
    
    const success = await sessionService.deleteSession(currentSession.id);
    if (success) {
      setShowDeleteModal(false);
      // Reindirizza alla landing page dopo l'eliminazione
      router.push('/');
    } else {
      // In caso di errore, mostra un alert (fallback)
      alert('Errore nell\'eliminazione della partita. Riprova.');
      setShowDeleteModal(false);
    }
  };

  return (
    <header className="text-center mb-12">
      <div className="max-w-4xl mx-auto">
        {/* Logo e titolo */}
        <div className="mb-8">
          <h1 className="text-6xl font-extralight text-slate-800 mb-2 tracking-tight">
            AuraCount
          </h1>
          <p className="text-slate-500 text-lg font-light">
            Traccia l&apos;aura dei tuoi amici
          </p>
          {currentSession && (
            <div className="mt-2 text-slate-400 text-sm">
              Partita: {currentSession.name} • Codice: <span className="font-mono font-semibold">{currentSession.code}</span>
            </div>
          )}
        </div>
        
        {/* Controlli */}
        <div className="flex flex-wrap justify-center gap-3">
          {/* Torna alla home */}
          <button
            onClick={handleBackToHome}
            className="glass-card hover:bg-white/90 rounded-2xl px-6 py-3 transition-all duration-300 group"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
              <span className="text-slate-700 font-medium">
                🏠 Home
              </span>
            </div>
          </button>

          {/* Contatore giocatori */}
          <div className="glass-card rounded-2xl px-6 py-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
              <span className="text-slate-700 font-medium">
                👥 {playersCount} {playersCount === 1 ? 'Giocatore' : 'Giocatori'}
              </span>
            </div>
          </div>
          
          {/* Toggle storico - solo mobile */}
          <button
            onClick={onToggleHistory}
            className="glass-card hover:bg-white/90 rounded-2xl px-6 py-3 transition-all duration-300 lg:hidden group"
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full transition-colors ${showHistory ? 'bg-rose-400' : 'bg-slate-400'}`}></div>
              <span className="text-slate-700 font-medium">
                📊 {showHistory ? 'Nascondi' : 'Mostra'} Storico
              </span>
            </div>
          </button>
          
          {/* Reset gioco */}
          {playersCount > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Sei sicuro di voler resettare il gioco? Tutti i dati verranno persi!')) {
                  onResetGame();
                }
              }}
              className="glass-card hover:bg-rose-50 rounded-2xl px-6 py-3 transition-all duration-300 group"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-rose-400 rounded-full group-hover:bg-rose-500 transition-colors"></div>
                <span className="text-slate-700 font-medium group-hover:text-rose-700 transition-colors">
                  🔄 Reset
                </span>
              </div>
            </button>
          )}

          {/* Elimina partita */}
          {currentSession && (
            <button
              onClick={handleDeleteGame}
              className="glass-card hover:bg-red-50 rounded-2xl px-6 py-3 transition-all duration-300 group"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full group-hover:bg-red-600 transition-colors"></div>
                <span className="text-slate-700 font-medium group-hover:text-red-700 transition-colors">
                  🗑️ Elimina Partita
                </span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Stato connessione database - sempre visibile */}
      <div className="mt-4">
        <DatabaseStatus isLoading={isLoading} isConnected={isConnected} />
      </div>

      {/* Modal di conferma eliminazione */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Elimina Partita"
        message={`Sei sicuro di voler eliminare definitivamente la partita "${currentSession?.name}"?\n\nTutti i dati dei giocatori e lo storico verranno persi per sempre!`}
        confirmText="🗑️ Elimina"
        cancelText="Annulla"
        onConfirm={confirmDeleteGame}
        onCancel={() => setShowDeleteModal(false)}
        isDangerous={true}
      />
    </header>
  );
}
