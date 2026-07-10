import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ChevronUp, ChevronDown } from 'lucide-react';
import type { Inventario } from '@/data/inventarios';

interface InventarioViewProps {
  inventario: Inventario;
  selectedProductoIndex?: number;
  onBack: () => void;
  onUpdateCantidad: (inventarioId: string, productoIndex: number, delta: number) => void;
  onSetCantidad: (inventarioId: string, productoIndex: number, cantidad: number) => void;
}

type SortMode = 'nombre' | 'cantidad' | 'cantidad-desc';

export function InventarioView({ inventario, selectedProductoIndex, onBack, onUpdateCantidad, onSetCantidad }: InventarioViewProps) {
  const [sort, setSort] = useState<SortMode>('nombre');
  const [editandoIdx, setEditandoIdx] = useState<number | null>(null);
  const [editValor, setEditValor] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const sortedProductos = [...inventario.productos].sort((a, b) => {
    switch (sort) {
      case 'cantidad': return a.cantidad - b.cantidad;
      case 'cantidad-desc': return b.cantidad - a.cantidad;
      default: return a.nombre.localeCompare(b.nombre);
    }
  });

  useEffect(() => {
    if (selectedProductoIndex == null) return;
    const targetNombre = inventario.productos[selectedProductoIndex]?.nombre;
    if (!targetNombre) return;
    const el = itemRefs.current.get(targetNombre);
    if (el && scrollRef.current) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedProductoIndex, inventario.productos]);

  const handleStartEdit = (idx: number, cantidadActual: number) => {
    setEditandoIdx(idx);
    setEditValor(cantidadActual.toString());
  };

  const handleFinishEdit = (idx: number) => {
    const val = parseInt(editValor, 10);
    if (!isNaN(val) && val >= 0) {
      onSetCantidad(inventario.id, idx, val);
    }
    setEditandoIdx(null);
    setEditValor('');
  };

  const toggleSort = () => {
    setSort(prev => {
      if (prev === 'nombre') return 'cantidad-desc';
      if (prev === 'cantidad-desc') return 'cantidad';
      return 'nombre';
    });
  };

  const getCantidadColor = (cantidad: number) => {
    if (cantidad === 0) return 'var(--ios-red)';
    if (cantidad <= 2) return 'var(--ios-orange)';
    return 'var(--ios-green)';
  };

  return (
    <div className="h-full flex flex-col animate-fadeIn">
      {/* Header */}
      <div className="shrink-0 pt-6 pb-3 px-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="btn-glass rounded-full p-2.5 flex items-center justify-center"
            aria-label="Volver"
          >
            <ArrowLeft size={20} strokeWidth={2} />
          </button>
          <div className="flex-1 min-w-0">
            <h2 
              className="text-xl font-semibold truncate"
              style={{ fontFamily: "'SF Pro Display', system-ui" }}
            >
              {inventario.nombre}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--ios-text-tertiary)' }}>
              {inventario.productos.length} productos
            </p>
          </div>
          <button
            onClick={toggleSort}
            className="btn-glass rounded-full px-4 py-2 text-xs font-medium flex items-center gap-1.5"
          >
            {sort === 'cantidad' ? <ChevronUp size={14} /> :
             sort === 'cantidad-desc' ? <ChevronDown size={14} /> : null}
            {sort === 'nombre' ? 'A-Z' : 'Cant.'}
          </button>
        </div>
      </div>

      {/* Column headers */}
      <div 
        className="shrink-0 grid grid-cols-[1fr_110px] px-5 py-2 text-xs font-semibold uppercase tracking-wider"
        style={{ color: 'var(--ios-text-tertiary)', borderBottom: '1px solid var(--ios-border)' }}
      >
        <span>Producto</span>
        <span className="text-right">Cantidad</span>
      </div>

      {/* Product list */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar px-5">
        <div className="space-y-1 py-2">
          {sortedProductos.map((prod) => {
            const originalIdx = inventario.productos.findIndex(p => p.nombre === prod.nombre);
            const cantidadColor = getCantidadColor(prod.cantidad);
            const isEditing = editandoIdx === originalIdx;

            return (
              <div
                key={prod.nombre}
                ref={el => { if (el) itemRefs.current.set(prod.nombre, el); }}
                className="grid grid-cols-[1fr_110px] items-center py-3 px-3 rounded-xl transition-colors hover:bg-[var(--ios-hover)]"
                style={{ borderBottom: '1px solid var(--ios-border)' }}
              >
                {/* Product name */}
                <span className="text-[14px] pr-3 leading-snug" style={{ color: prod.cantidad === 0 ? 'var(--ios-text-tertiary)' : 'var(--ios-text-primary)' }}>
                  {prod.nombre}
                </span>

                {/* Quantity controls */}
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onUpdateCantidad(inventario.id, originalIdx, -1)}
                    className="qty-btn minus"
                    aria-label="Disminuir"
                  >
                    -
                  </button>

                  {isEditing ? (
                    <input
                      type="number"
                      value={editValor}
                      onChange={e => setEditValor(e.target.value)}
                      onBlur={() => handleFinishEdit(originalIdx)}
                      onKeyDown={e => e.key === 'Enter' && handleFinishEdit(originalIdx)}
                      className="w-10 text-center bg-transparent text-base font-semibold outline-none"
                      style={{ color: cantidadColor }}
                      autoFocus
                      min={0}
                    />
                  ) : (
                    <button
                      onClick={() => handleStartEdit(originalIdx, prod.cantidad)}
                      className="w-10 text-center text-base font-semibold transition-colors"
                      style={{ color: cantidadColor }}
                    >
                      {prod.cantidad}
                    </button>
                  )}

                  <button
                    onClick={() => onUpdateCantidad(inventario.id, originalIdx, 1)}
                    className="qty-btn plus"
                    aria-label="Aumentar"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="h-6" />
      </div>
    </div>
  );
}
