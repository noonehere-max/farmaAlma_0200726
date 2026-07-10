import {
  Sparkles,
  Armchair,
  Paintbrush,
  Leaf,
  Settings,
  Search,
  UserCircle,
  History,
  AlertCircle,
  PackageX,
  AlertTriangle,
} from 'lucide-react';
import type { Inventario, Producto } from '@/data/inventarios';

interface NotificacionItem {
  inventario: Inventario;
  producto: Producto;
  index: number;
  nivel: 'agotado' | 'pocos';
}

interface MenuPrincipalProps {
  inventarios: Inventario[];
  userName: string;
  onSelectInventario: (id: string) => void;
  onSelectProducto: (inventarioId: string, productoIndex: number) => void;
  onBuscar: () => void;
  onConfiguracion: () => void;
  onHistorial: () => void;
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

export function MenuPrincipal({
  inventarios,
  userName,
  onSelectInventario,
  onSelectProducto,
  onBuscar,
  onConfiguracion,
  onHistorial,
}: MenuPrincipalProps) {
  const notificaciones: NotificacionItem[] = [];
  for (const inv of inventarios) {
    inv.productos.forEach((prod, idx) => {
      if (prod.cantidad === 0) {
        notificaciones.push({ inventario: inv, producto: prod, index: idx, nivel: 'agotado' });
      }
    });
  }

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
          <div className="flex items-center gap-2">
            {/* Active user badge */}
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{
                background: 'var(--ios-surface)',
                color: 'var(--ios-text-secondary)',
                border: '1px solid var(--ios-border)',
              }}
            >
              <UserCircle size={14} strokeWidth={1.5} />
              <span>{userName}</span>
            </div>
            <button
              onClick={onHistorial}
              className="btn-glass rounded-full p-3"
              aria-label="Historial"
            >
              <History size={20} strokeWidth={1.5} />
            </button>
            <button
              onClick={onConfiguracion}
              className="btn-glass rounded-full p-3"
              aria-label="Configuración"
            >
              <Settings size={20} strokeWidth={1.5} />
            </button>
          </div>
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
          {inventarios.map(inv => {
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
        <div
          className="mt-6 liquid-glass rounded-2xl p-4 animate-fadeInUp"
          style={{ opacity: 0, animationFillMode: 'forwards', animationDelay: '0.35s' }}
        >
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: 'var(--ios-text-secondary)' }}>Total productos</span>
            <span className="font-semibold">
              {inventarios.reduce((acc, inv) => acc + inv.productos.length, 0)}
            </span>
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

        {/* Notificaciones */}
        <div className="mt-6 animate-fadeInUp" style={{ opacity: 0, animationFillMode: 'forwards', animationDelay: '0.45s' }}>
          <div className="flex items-center gap-2 px-1 mb-3">
            <AlertCircle size={16} strokeWidth={1.5} style={{ color: 'var(--ios-orange)' }} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--ios-text-secondary)' }}>
              Notificaciones
            </h3>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'var(--ios-surface)', color: 'var(--ios-text-tertiary)' }}
            >
              {notificaciones.length}
            </span>
          </div>

          {notificaciones.length === 0 ? (
            <div
              className="liquid-glass rounded-2xl p-4 text-center text-sm"
              style={{ color: 'var(--ios-text-tertiary)' }}
            >
              No hay productos agotados.
            </div>
          ) : (
            <div className="space-y-2">
              {notificaciones.map((item, idx) => {
                const isAgotado = item.nivel === 'agotado';
                const color = isAgotado ? 'var(--ios-red)' : 'var(--ios-orange)';
                const Icon = isAgotado ? PackageX : AlertTriangle;
                const label = isAgotado ? 'Agotado' : 'Pocos';

                return (
                  <button
                    key={`${item.inventario.id}-${item.producto.nombre}-${idx}`}
                    onClick={() => onSelectProducto(item.inventario.id, item.index)}
                    className="w-full liquid-glass rounded-2xl p-3 flex items-center gap-3 text-left transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `${color}15`,
                        color: color,
                        border: `1px solid ${color}25`,
                      }}
                    >
                      <Icon size={16} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] truncate">{item.producto.nombre}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--ios-text-tertiary)' }}>
                        {item.inventario.nombre}
                      </p>
                    </div>
                    <span
                      className="text-[10px] px-2 py-1 rounded-full font-medium flex-shrink-0"
                      style={{
                        background: `${color}15`,
                        color: color,
                        border: `1px solid ${color}25`,
                      }}
                    >
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
