import { Bot, Sparkles, Search, Lightbulb, AlertCircle } from 'lucide-react';
import type { Inventario, Producto } from '@/data/inventarios';
import { askGabriel, type GabrielState } from '@/lib/gabriel';

interface GabrielAssistantProps {
  query: string;
  results: { producto: Producto; inventario: Inventario; index: number }[];
  inventarios: Inventario[];
  onSuggest: (query: string) => void;
}

const stateIcon: Record<GabrielState, React.ReactNode> = {
  idle: <Sparkles size={16} strokeWidth={1.5} />,
  searching: <Search size={16} strokeWidth={1.5} />,
  'no-results': <Lightbulb size={16} strokeWidth={1.5} />,
  results: <Bot size={16} strokeWidth={1.5} />,
};

export function GabrielAssistant({ query, results, inventarios, onSuggest }: GabrielAssistantProps) {
  const gabriel = askGabriel(query, results, inventarios);

  return (
    <div className="liquid-glass rounded-2xl p-4 animate-fadeIn">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'var(--ios-surface)',
            color: 'var(--ios-blue)',
            border: '1px solid var(--ios-border)',
          }}
        >
          {stateIcon[gabriel.state]}
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: 'var(--ios-text-primary)' }}>
              Gabriel
            </span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              style={{
                background: 'var(--ios-surface)',
                color: 'var(--ios-text-tertiary)',
              }}
            >
              Asistente
            </span>
          </div>

          <p className="text-sm leading-relaxed" style={{ color: 'var(--ios-text-secondary)' }}>
            {gabriel.message}
          </p>

          {gabriel.insight && (
            <div
              className="flex items-center gap-2 text-xs rounded-xl px-3 py-2"
              style={{
                background: 'rgba(255, 59, 48, 0.08)',
                color: 'var(--ios-red)',
                border: '1px solid rgba(255, 59, 48, 0.15)',
              }}
            >
              <AlertCircle size={14} strokeWidth={1.5} />
              <span>{gabriel.insight}</span>
            </div>
          )}

          {gabriel.suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {gabriel.suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => onSuggest(suggestion.query)}
                  className="text-xs px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'var(--ios-surface)',
                    color: 'var(--ios-blue)',
                    border: '1px solid var(--ios-border)',
                  }}
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
