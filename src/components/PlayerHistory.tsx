import { AuraAction } from '@/types';

interface PlayerHistoryProps {
  actions: AuraAction[];
}

export default function PlayerHistory({ actions }: PlayerHistoryProps) {
  const getActionIcon = (change: number) => {
    if (change > 0) return '📈';
    return '📉';
  };

  const getActionColor = (change: number) => {
    if (change > 0) return 'text-emerald-600';
    return 'text-rose-600';
  };

  const getActionBorderColor = (change: number) => {
    if (change > 0) return 'border-emerald-300';
    return 'border-rose-300';
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
        month: '2-digit',
        year: '2-digit'
      });
    }
  };

  // Raggruppa le azioni per data
  const groupActionsByDate = (actions: AuraAction[]) => {
    const groups: { [key: string]: AuraAction[] } = {};
    
    actions.forEach(action => {
      const dateKey = action.timestamp.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(action);
    });

    return Object.entries(groups).sort(([a], [b]) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
  };

  const groupedActions = groupActionsByDate(actions);

  if (actions.length === 0) {
    return (
      <div className="glass-card rounded-3xl p-8">
        <h3 className="text-2xl font-semibold text-slate-800 mb-6 text-center">
          Storico Personale
        </h3>
        <div className="text-center text-slate-500">
          <div className="text-6xl mb-4">🎭</div>
          <p className="text-lg">Nessuna azione ancora registrata</p>
          <p className="text-sm mt-2">Le azioni di questo giocatore appariranno qui!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-3xl p-6">
      <h3 className="text-2xl font-semibold text-slate-800 mb-6 text-center">
        Storico Personale ({actions.length} azioni)
      </h3>
      
      <div className="space-y-6 max-h-96 overflow-y-auto">
        {groupedActions.map(([dateString, dayActions]) => (
          <div key={dateString} className="space-y-3">
            {/* Intestazione del giorno */}
            <div className="text-center">
              <div className="bg-white/40 rounded-full px-4 py-2 inline-block">
                <span className="text-slate-700 font-medium">
                  {formatDate(new Date(dateString))}
                </span>
              </div>
            </div>

            {/* Azioni del giorno */}
            <div className="space-y-3">
              {dayActions.map((action) => (
                <div 
                  key={action.id}
                  className={`bg-white/40 rounded-2xl p-4 border-l-4 ${getActionBorderColor(action.change)} hover:bg-white/50 transition-all duration-200`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{getActionIcon(action.change)}</span>
                      <span className={`font-semibold text-lg ${getActionColor(action.change)}`}>
                        {action.change > 0 ? '+' : ''}{action.change}
                      </span>
                      <span className="text-slate-600 text-sm">aura</span>
                    </div>
                    <span className="text-slate-500 text-sm">
                      {formatTime(action.timestamp)}
                    </span>
                  </div>
                  
                  {action.reason && (
                    <div className="bg-white/40 rounded-xl p-3 mt-3">
                      <div className="text-slate-600 text-sm italic">
                        <span className="mr-2">💭</span>
                        {action.reason}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Statistiche riassuntive dello storico */}
      <div className="border-t border-slate-200 pt-4 mt-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/40 rounded-2xl p-3">
            <div className="text-emerald-600 font-semibold text-lg">
              +{actions.filter(a => a.change > 0).reduce((sum, a) => sum + a.change, 0)}
            </div>
            <div className="text-slate-600 text-xs">Aura Guadagnata</div>
          </div>
          <div className="bg-white/40 rounded-2xl p-3">
            <div className="text-rose-600 font-semibold text-lg">
              {actions.filter(a => a.change < 0).reduce((sum, a) => sum + a.change, 0)}
            </div>
            <div className="text-slate-600 text-xs">Aura Persa</div>
          </div>
          <div className="bg-white/40 rounded-2xl p-3">
            <div className="text-teal-600 font-semibold text-lg">
              {actions.length}
            </div>
            <div className="text-slate-600 text-xs">Azioni Totali</div>
          </div>
        </div>
      </div>
    </div>
  );
}
