import { useState } from 'react';
import { ArrowLeft, Trash2, User, Package, Edit3, Plus, MoveRight, AlertCircle } from 'lucide-react';
import type { Inventario } from '@/data/inventarios';
import type { HistorialEntry, HistorialAccion } from '@/hooks/useHistorial';

interface HistorialViewProps {
  historial: HistorialEntry[];
  inventarios: Inventario[];
  onBack: () => void;
  onClear: () => void;
}

const ACTION_CONFIG: Record<
  HistorialAccion,
  { label: string; icon: React.ReactNode; color: string }
> = {
  crear: {
    label: 'Añadido',
    icon: <Plus size={14} strokeWidth={2} />,
    color: 'var(--ios-green)',
  },
  editar: {
    label: 'Editado',
    icon: <Edit3 size={14} strokeWidth={2} />,
    color: 'var(--ios-blue)',
  },
  eliminar: {
    label: 'Eliminado',
    icon: <Trash2 size={14} strokeWidth={2} />,
    color: 'var(--ios-red)',
  },
  mover: {
    label: 'Movido',
    icon: <MoveRight size={14} strokeWidth={2} />,
    color: 'var(--ios-orange)',
  },
};

function formatDate(fecha: string) {
  const d = new Date(fecha);
  return d.toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function HistorialView({ historial, inventarios, onBack, onClear }: HistorialViewProps) {
  const [confirmClear, setConfirmClear] = useState(false);

  const handleClear = () => {
    if (confirmClear) {
      onClear();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
    }
  };

  return (
    <div className="h-full flex flex-col animate-fadeIn">
      {/* Header */}
      <div className="shrink-0 pt-6 pb-4 px-5">
        <div className="flex items-center justify-between">
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
              Historial
            </h2>
          </div>
          {historial.length > 0 && (
            <button
              onClick={handleClear}
              className="btn-glass rounded-full px-4 py-2 text-xs font-medium flex items-center gap-1.5"
              style={{ color: confirmClear ? 'var(--ios-red)' : 'var(--ios-text-secondary)' }}
            >
              <Trash2 size={14} strokeWidth={2} />
              {confirmClear ? 'Confirmar' : 'Limpiar'}
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5">
        {historial.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 animate-fadeIn">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--ios-surface)' }}
            >
              <AlertCircle size={28} strokeWidth={1.5} style={{ color: 'var(--ios-text-tertiary)' }} />
            </div>
            <p className="text-sm text-center" style={{ color: 'var(--ios-text-tertiary)' }}>
              No hay cambios registrados todavía.
            </p>
          </div>
        ) : (
          <div className="space-y-3 py-2 animate-fadeInUp">
            {historial.map(entry => {
              const action = ACTION_CONFIG[entry.accion];
              const inventario = inventarios.find(i => i.id === entry.inventarioId);

              return (
                <div
                  key={entry.id ?? `${entry.fecha}-${entry.productoNombre}`}
                  className="liquid-glass rounded-2xl p-4 space-y-3"
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: `${action.color}15`,
                          color: action.color,
                          border: `1px solid ${action.color}25`,
                        }}
                      >
                        {action.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-medium truncate">{entry.productoNombre}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--ios-text-tertiary)' }}>
                          {inventario?.nombre ?? entry.inventarioId}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--ios-text-tertiary)' }}>
                      {formatDate(entry.fecha)}
                    </span>
                  </div>

                  {/* User */}
                  <div
                    className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl"
                    style={{ background: 'var(--ios-surface)', color: 'var(--ios-text-secondary)' }}
                  >
                    <User size={12} strokeWidth={1.5} />
                    <span className="truncate">{entry.usuario}</span>
                  </div>

                  {/* Cambios */}
                  {entry.cambios.length > 0 && (
                    <div className="space-y-1.5">
                      {entry.cambios.map((cambio, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-xs"
                          style={{ color: 'var(--ios-text-secondary)' }}
                        >
                          <Package size={12} strokeWidth={1.5} style={{ color: 'var(--ios-text-tertiary)' }} />
                          <span className="capitalize flex-shrink-0">{cambio.campo}:</span>
                          <span className="truncate line-through" style={{ color: 'var(--ios-text-tertiary)' }}>
                            {cambio.anterior || '-'}
                          </span>
                          <span style={{ color: 'var(--ios-text-tertiary)' }}>→</span>
                          <span className="truncate font-medium" style={{ color: 'var(--ios-text-primary)' }}>
                            {cambio.nuevo || '-'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <div className="h-6" />
          </div>
        )}
      </div>
    </div>
  );
}
