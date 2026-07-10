import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { Producto, Inventario } from '@/data/inventarios';

interface ProductoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'crear' | 'editar';
  inventarios: Inventario[];
  inventarioId?: string;
  producto?: Producto;
  productoIndex?: number;
  onSave: (data: {
    inventarioId: string;
    producto: Producto;
    productoIndex?: number;
    inventarioIdAnterior?: string;
  }) => void | Promise<void>;
  error?: string;
}

export function ProductoFormDialog({
  open,
  onOpenChange,
  mode,
  inventarios,
  inventarioId,
  producto,
  productoIndex,
  onSave,
  error: externalError,
}: ProductoFormDialogProps) {
  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [costoTienda, setCostoTienda] = useState('');
  const [precioCliente, setPrecioCliente] = useState('');
  const [selectedInventarioId, setSelectedInventarioId] = useState('');
  const [localError, setLocalError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setNombre(producto?.nombre ?? '');
      setCantidad(producto?.cantidad != null ? String(producto.cantidad) : '');
      setCostoTienda(producto?.costoFI ?? '');
      setPrecioCliente(producto?.precioPublico ?? '');
      setSelectedInventarioId(inventarioId ?? inventarios[0]?.id ?? '');
      setLocalError('');
      setSaving(false);
    }
  }, [open, producto, inventarioId, inventarios]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    const nombreTrim = nombre.trim();
    if (!nombreTrim) {
      setLocalError('El nombre es obligatorio');
      return;
    }

    const cantidadNum = parseInt(cantidad, 10);
    if (isNaN(cantidadNum) || cantidadNum < 0) {
      setLocalError('La cantidad debe ser un número mayor o igual a 0');
      return;
    }

    const nuevoProducto: Producto = {
      nombre: nombreTrim,
      cantidad: cantidadNum,
      costoFI: costoTienda.trim(),
      precioPublico: precioCliente.trim(),
    };

    setSaving(true);
    try {
      await onSave({
        inventarioId: selectedInventarioId,
        producto: nuevoProducto,
        productoIndex,
        inventarioIdAnterior: inventarioId,
      });
      onOpenChange(false);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Ocurrió un error');
    } finally {
      setSaving(false);
    }
  };

  const error = externalError || localError;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="glass-sheet border-0 sm:max-w-[360px] rounded-3xl p-6 gap-0"
        style={{ background: 'var(--ios-surface-solid)', backdropFilter: 'blur(60px)' }}
      >
        <DialogHeader className="space-y-2 pb-4">
          <DialogTitle className="text-center text-lg font-semibold">
            {mode === 'crear' ? 'Añadir producto' : 'Editar producto'}
          </DialogTitle>
          <DialogDescription className="text-center text-sm" style={{ color: 'var(--ios-text-secondary)' }}>
            {mode === 'crear'
              ? 'Completa los datos del nuevo producto.'
              : 'Modifica los campos que necesites.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium px-1" style={{ color: 'var(--ios-text-secondary)' }}>
              Nombre
            </label>
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej. Desodorante Hombre 16 oz"
              className="w-full rounded-xl px-4 py-3 text-[15px] outline-none"
              style={{
                background: 'var(--ios-surface)',
                color: 'var(--ios-text-primary)',
                border: '1px solid var(--ios-border)',
              }}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium px-1" style={{ color: 'var(--ios-text-secondary)' }}>
                Cantidad
              </label>
              <input
                type="number"
                value={cantidad}
                onChange={e => setCantidad(e.target.value)}
                min={0}
                className="w-full rounded-xl px-3 py-3 text-[15px] outline-none text-center"
                style={{
                  background: 'var(--ios-surface)',
                  color: 'var(--ios-text-primary)',
                  border: '1px solid var(--ios-border)',
                }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium px-1" style={{ color: 'var(--ios-text-secondary)' }}>
                Costo tienda
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={costoTienda}
                onChange={e => setCostoTienda(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl px-3 py-3 text-[15px] outline-none text-center"
                style={{
                  background: 'var(--ios-surface)',
                  color: 'var(--ios-text-primary)',
                  border: '1px solid var(--ios-border)',
                }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium px-1" style={{ color: 'var(--ios-text-secondary)' }}>
                Precio cliente
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={precioCliente}
                onChange={e => setPrecioCliente(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl px-3 py-3 text-[15px] outline-none text-center"
                style={{
                  background: 'var(--ios-surface)',
                  color: 'var(--ios-text-primary)',
                  border: '1px solid var(--ios-border)',
                }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium px-1" style={{ color: 'var(--ios-text-secondary)' }}>
              Catálogo
            </label>
            <select
              value={selectedInventarioId}
              onChange={e => setSelectedInventarioId(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-[15px] outline-none appearance-none"
              style={{
                background: 'var(--ios-surface)',
                color: 'var(--ios-text-primary)',
                border: '1px solid var(--ios-border)',
              }}
            >
              {inventarios.map(inv => (
                <option key={inv.id} value={inv.id}>
                  {inv.nombre}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div
              className="text-xs text-center rounded-xl px-3 py-2"
              style={{
                background: 'rgba(255, 59, 48, 0.08)',
                color: 'var(--ios-red)',
                border: '1px solid rgba(255, 59, 48, 0.15)',
              }}
            >
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-xl text-[15px] font-medium transition-all active:scale-[0.98] disabled:opacity-60"
              style={{
                background: 'var(--ios-blue)',
                color: '#fff',
              }}
            >
              {saving ? 'Guardando...' : mode === 'crear' ? 'Añadir' : 'Guardar cambios'}
            </button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-full py-3 rounded-xl text-[15px] font-medium transition-all active:scale-[0.98] btn-glass"
              style={{ color: 'var(--ios-blue)' }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
