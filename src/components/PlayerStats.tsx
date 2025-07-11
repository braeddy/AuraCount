import { Player, AuraAction } from '@/types';

interface PlayerStatsProps {
  player: Player;
  actions: AuraAction[];
}

export default function PlayerStats({ player, actions }: PlayerStatsProps) {
  // Calcola statistiche
  const totalActions = actions.length;
  const positiveActions = actions.filter(a => a.change > 0).length;
  const negativeActions = actions.filter(a => a.change < 0).length;
  const totalAuraGained = actions.filter(a => a.change > 0).reduce((sum, a) => sum + a.change, 0);
  const totalAuraLost = Math.abs(actions.filter(a => a.change < 0).reduce((sum, a) => sum + a.change, 0));
  const netAura = totalAuraGained - totalAuraLost;
  
  // Trova l'azione più grande (guadagno e perdita)
  const biggestGain = actions.filter(a => a.change > 0).reduce((max, a) => a.change > max.change ? a : max, { change: 0 } as AuraAction);
  const biggestLoss = actions.filter(a => a.change < 0).reduce((min, a) => a.change < min.change ? a : min, { change: 0 } as AuraAction);
  
  // Calcola giorni da quando è stato creato
  const daysSinceCreation = Math.floor((Date.now() - player.createdAt.getTime()) / (1000 * 60 * 60 * 24));
  
  // Media aura per giorno
  const averageAuraPerDay = daysSinceCreation > 0 ? (netAura / daysSinceCreation).toFixed(1) : '0';

  const stats = [
    {
      label: 'Azioni Totali',
      value: totalActions,
      icon: '📊',
      color: 'text-teal-600'
    },
    {
      label: 'Azioni Positive',
      value: positiveActions,
      icon: '📈',
      color: 'text-emerald-600'
    },
    {
      label: 'Azioni Negative',
      value: negativeActions,
      icon: '📉',
      color: 'text-rose-600'
    },
    {
      label: 'Aura Guadagnata',
      value: `+${totalAuraGained}`,
      icon: '✨',
      color: 'text-emerald-600'
    },
    {
      label: 'Aura Persa',
      value: `-${totalAuraLost}`,
      icon: '💔',
      color: 'text-rose-600'
    },
    {
      label: 'Aura Netta',
      value: netAura >= 0 ? `+${netAura}` : `${netAura}`,
      icon: '⚖️',
      color: netAura >= 0 ? 'text-emerald-600' : 'text-rose-600'
    },
    {
      label: 'Media/Giorno',
      value: `${averageAuraPerDay}`,
      icon: '📅',
      color: 'text-indigo-600'
    },
    {
      label: 'Giorni Attivo',
      value: Math.max(daysSinceCreation, 1),
      icon: '🗓️',
      color: 'text-teal-600'
    }
  ];

  return (
    <div className="glass-card rounded-3xl p-6">
      <h3 className="text-2xl font-semibold text-slate-800 mb-6 text-center">
        Statistiche
      </h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white/40 rounded-2xl p-4 text-center">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className={`text-lg font-semibold ${stat.color} mb-1`}>
              {stat.value}
            </div>
            <div className="text-slate-600 text-sm">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Record personali */}
      {(biggestGain.change > 0 || biggestLoss.change < 0) && (
        <div className="border-t border-slate-200 pt-4">
          <h4 className="text-lg font-semibold text-slate-800 mb-3 text-center">
            Record Personali
          </h4>
          
          {biggestGain.change > 0 && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 mb-3 border border-emerald-200">
              <div className="flex items-center justify-between">
                <span className="text-emerald-700 font-semibold">
                  🚀 Maggior Guadagno
                </span>
                <span className="text-emerald-700 font-bold">
                  +{biggestGain.change}
                </span>
              </div>
              {biggestGain.reason && (
                <div className="text-slate-600 text-sm mt-1">
                  &ldquo;{biggestGain.reason}&rdquo;
                </div>
              )}
            </div>
          )}

          {biggestLoss.change < 0 && (
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-4 border border-rose-200">
              <div className="flex items-center justify-between">
                <span className="text-rose-700 font-semibold">
                  💥 Maggior Perdita
                </span>
                <span className="text-rose-700 font-bold">
                  {biggestLoss.change}
                </span>
              </div>
              {biggestLoss.reason && (
                <div className="text-slate-600 text-sm mt-1">
                  &ldquo;{biggestLoss.reason}&rdquo;
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
