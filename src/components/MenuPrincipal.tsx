import { Sparkles, Armchair, Paintbrush, Leaf, Settings, Search } from 'lucide-react';
import type { Inventario } from '@/data/inventarios';

interface MenuPrincipalProps {
  inventarios: Inventario[];
  onSelectInventario: (id: string) => void;
  onBuscar: () => void;
  onConfiguracion: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  skincare: <Sparkles size={28} strokeWidth={1.5} />,
  cuidadocorporal: <Armchair size={28} strokeWidth={1.5} />,
  maquillaje: <Paintbrush size={28} strokeWidth={1.5} />,
  nutriplus: <Leaf size={28} strokeWidth={1.5} />,
};

const colorMap: Record<string, string> = {
  skincare: 'var(--ios-teal)',
  cuidadocorporal: 'var(--ios-orange)',
  maquillaje: 'var(--ios-pink)',
  nutriplus: 'var(--ios-green)',
};

export function MenuPrincipal({ inventarios, onSelectInventario, onBuscar, onConfiguracion }: MenuPrincipalProps) {
  return (
    <div className="h-full flex flex-col animate-fadeIn">
      {/* Header */}
      <div className="shrink-0 pt-6 pb-4 px-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 
              className="text-2xl font-semibold tracking-tight"
              style={{ fontFamily: "'SF Pro Display', system-ui" }}
            >
              Mi Almacén
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--ios-text-secondary)' }}>
              Selecciona un inventario
            </p>
          </div>
          <button
            onClick={onConfiguracion}
            className="btn-glass rounded-full p-3"
            aria-label="Configuración"
          >
            <Settings size={20} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="shrink-0 px-5 pb-4">
        <button
          onClick={onBuscar}
          className="liquid-glass w-full rounded-2xl px-4 py-3.5 flex items-center gap-3 text-left transition-all duration-200 hover:border-[var(--ios-border-hover)]"
        >
          <Search size={18} strokeWidth={1.5} style={{ color: 'var(--ios-text-tertiary)' }} />
          <span className="text-[15px]" style={{ color: 'var(--ios-text-tertiary)' }}>
            Buscar producto...
          </span>
        </button>
      </div>

      {/* Categories Grid - 2 columns */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-8">
        <div className="grid grid-cols-2 gap-4 stagger-children">
          {inventarios.map((inv) => {
            const totalProductos = inv.productos.length;
            const conStock = inv.productos.filter(p => p.cantidad > 0).length;
            const color = colorMap[inv.id] || 'var(--ios-blue)';

            return (
              <button
                key={inv.id}
                onClick={() => onSelectInventario(inv.id)}
                className="liquid-glass rounded-3xl p-5 flex flex-col items-start gap-4 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] animate-fadeInUp"
                style={{ opacity: 0, animationFillMode: 'forwards' }}
              >
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ 
                    background: `${color}15`,
                    color: color,
                    border: `1px solid ${color}25`,
                  }}
                >
                  {iconMap[inv.id]}
                </div>

                {/* Info */}
                <div className="space-y-1">
                  <h3 className="text-[15px] font-semibold leading-tight">{inv.nombre}</h3>
                  <p className="text-xs" style={{ color: 'var(--ios-text-tertiary)' }}>
                    {conStock}/{totalProductos} con stock
                  </p>
                </div>

                {/* Mini progress */}
                <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'var(--ios-border)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(conStock / totalProductos) * 100}%`,
                      background: color,
                      opacity: 0.7,
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Stats summary */}
        <div className="mt-6 liquid-glass rounded-2xl p-4 animate-fadeInUp" style={{ opacity: 0, animationFillMode: 'forwards', animationDelay: '0.35s' }}>
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: 'var(--ios-text-secondary)' }}>Total productos</span>
            <span className="font-semibold">{inventarios.reduce((acc, inv) => acc + inv.productos.length, 0)}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span style={{ color: 'var(--ios-text-secondary)' }}>Con existencias</span>
            <span className="font-semibold" style={{ color: 'var(--ios-green)' }}>
              {inventarios.reduce((acc, inv) => acc + inv.productos.filter(p => p.cantidad > 0).length, 0)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span style={{ color: 'var(--ios-text-secondary)' }}>Agotados</span>
            <span className="font-semibold" style={{ color: 'var(--ios-red)' }}>
              {inventarios.reduce((acc, inv) => acc + inv.productos.filter(p => p.cantidad === 0).length, 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
