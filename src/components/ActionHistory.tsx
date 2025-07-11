import { AuraAction } from '@/types';

interface ActionHistoryProps {
  actions: AuraAction[];
}

export default function ActionHistory({ actions }: ActionHistoryProps) {
  const getActionIcon = (change: number) => {
    if (change > 0) return '📈';
    return '📉';
  };

  const getActionColor = (change: number) => {
    if (change > 0) return 'text-emerald-600';
    return 'text-rose-600';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('it-IT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Oggi';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ieri';
    } else {
      return date.toLocaleDateString('it-IT', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  if (actions.length === 0) {
    return (
      <div className="glass-card rounded-3xl p-6">
        <h3 className="text-xl font-semibold text-slate-800 mb-4 text-center">
          Storico Azioni
        </h3>
        <div className="text-center text-slate-500">
          <p>Nessuna azione ancora registrata.</p>
          <p className="text-sm mt-2">Le azioni appariranno qui quando inizierai a giocare!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-3xl p-6">
      <h3 className="text-xl font-semibold text-slate-800 mb-4 text-center">
        Storico Azioni
      </h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {actions.map((action) => (
          <div 
            key={action.id}
            className="bg-white/40 rounded-2xl p-4 border-l-4 border-indigo-300"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-800 text-sm">
                {action.playerName}
              </span>
              <span className="text-slate-500 text-xs">
                {formatDate(action.timestamp)} {formatTime(action.timestamp)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getActionIcon(action.change)}</span>
              <span className={`font-semibold ${getActionColor(action.change)}`}>
                {action.change > 0 ? '+' : ''}{action.change}
              </span>
              <span className="text-slate-600 text-sm">aura</span>
            </div>
            
            {action.reason && (
              <div className="mt-2 text-slate-600 text-xs italic">
                {action.reason}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
