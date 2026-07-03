import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Search, PackageOpen } from 'lucide-react';
import type { Producto, Inventario } from '@/data/inventarios';
import { GabrielAssistant } from '@/components/GabrielAssistant';

interface BusquedaProps {
  onBack: () => void;
  onSelectResult: (inventarioId: string, productoIndex: number) => void;
  buscarGlobal: (query: string) => { producto: Producto; inventario: Inventario; index: number }[];
  inventarios: Inventario[];
}

export function Busqueda({ onBack, onSelectResult, buscarGlobal, inventarios }: BusquedaProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ producto: Producto; inventario: Inventario; index: number }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        setResults(buscarGlobal(query));
      } else {
        setResults([]);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [query, buscarGlobal]);

  const categoryColor: Record<string, string> = {
    skincare: 'var(--ios-teal)',
    cuidadocorporal: 'var(--ios-orange)',
    maquillaje: 'var(--ios-pink)',
    nutriplus: 'var(--ios-green)',
  };

  return (
    <div className="h-full flex flex-col animate-fadeIn">
      {/* Header with search */}
      <div className="shrink-0 pt-6 pb-4 px-5 space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="btn-glass rounded-full p-2.5 flex items-center justify-center"
            aria-label="Volver"
          >
            <ArrowLeft size={20} strokeWidth={2} />
          </button>
          <h2 
            className="text-xl font-semibold"
            style={{ fontFamily: "'SF Pro Display', system-ui" }}
          >
            Buscar
          </h2>
        </div>

        <div className="liquid-glass rounded-2xl px-4 py-3 flex items-center gap-3">
          <Search size={18} strokeWidth={1.5} style={{ color: 'var(--ios-text-tertiary)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Nombre del producto..."
            className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-[var(--ios-text-tertiary)]"
            style={{ color: 'var(--ios-text-primary)' }}
          />
          {query && (
            <button
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              className="text-xs px-2 py-1 rounded-full"
              style={{ background: 'var(--ios-surface)', color: 'var(--ios-text-secondary)' }}
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Gabriel assistant */}
        <GabrielAssistant
          query={query}
          results={results}
          inventarios={inventarios}
          onSuggest={setQuery}
        />
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5">
        {!query.trim() ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 animate-fadeIn">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--ios-surface)' }}
            >
              <Search size={28} strokeWidth={1.5} style={{ color: 'var(--ios-text-tertiary)' }} />
            </div>
            <p className="text-sm text-center" style={{ color: 'var(--ios-text-tertiary)' }}>
              Escribe el nombre de un producto<br />para buscar en todos los inventarios
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 animate-fadeIn">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--ios-surface)' }}
            >
              <PackageOpen size={28} strokeWidth={1.5} style={{ color: 'var(--ios-text-tertiary)' }} />
            </div>
            <p className="text-sm text-center" style={{ color: 'var(--ios-text-tertiary)' }}>
              No se encontraron productos<br />con "{query}"
            </p>
          </div>
        ) : (
          <div className="space-y-1 py-2 animate-fadeInUp">
            <div className="text-xs font-semibold uppercase tracking-wider mb-3 px-1" style={{ color: 'var(--ios-text-tertiary)' }}>
              {results.length} resultado{results.length !== 1 ? 's' : ''}
            </div>
            {results.map((result) => {
              const color = categoryColor[result.inventario.id] || 'var(--ios-blue)';
              const cantidadColor = result.producto.cantidad === 0 ? 'var(--ios-red)' :
                result.producto.cantidad <= 2 ? 'var(--ios-orange)' : 'var(--ios-green)';

              return (
                <button
                  key={`${result.inventario.id}-${result.index}`}
                  onClick={() => onSelectResult(result.inventario.id, result.index)}
                  className="w-full text-left liquid-glass rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                >
                  {/* Category dot */}
                  <div 
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: color }}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] truncate">{result.producto.nombre}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--ios-text-tertiary)' }}>
                      {result.inventario.nombre}
                    </p>
                  </div>

                  {/* Quantity badge */}
                  <div 
                    className="flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold"
                    style={{ 
                      background: `${cantidadColor}15`,
                      color: cantidadColor,
                      border: `1px solid ${cantidadColor}25`,
                    }}
                  >
                    {result.producto.cantidad}
                  </div>
                </button>
              );
            })}
          </div>
        )}
        <div className="h-6" />
      </div>
    </div>
  );
}
