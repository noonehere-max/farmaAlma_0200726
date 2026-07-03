import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { inventariosData, type Inventario, type Producto } from '@/data/inventarios';

interface ProductoRow {
  id: number;
  inventario_id: string;
  nombre: string;
  cantidad: number;
  costo_fi: string;
  precio_publico: string;
  orden: number;
}

const INVENTORY_NAMES: Record<string, string> = {
  maquillaje: 'Maquillaje',
  skincare: 'Skincare 2026',
  cuidadocorporal: 'Cuidado Corporal',
  nutriplus: 'Nutriplus',
};

function rowsToInventarios(rows: ProductoRow[]): Inventario[] {
  const grouped: Record<string, Producto[]> = {
    maquillaje: [],
    skincare: [],
    cuidadocorporal: [],
    nutriplus: [],
  };

  for (const row of rows) {
    if (!grouped[row.inventario_id]) grouped[row.inventario_id] = [];
    grouped[row.inventario_id].push({
      nombre: row.nombre,
      cantidad: row.cantidad,
      costoFI: row.costo_fi,
      precioPublico: row.precio_publico,
    });
  }

  return Object.entries(grouped).map(([id, productos]) => ({
    id,
    nombre: INVENTORY_NAMES[id] || id,
    productos,
  }));
}

function inventariosToRows(inventarios: Inventario[]): Omit<ProductoRow, 'id'>[] {
  const rows: Omit<ProductoRow, 'id'>[] = [];
  for (const inv of inventarios) {
    inv.productos.forEach((prod, idx) => {
      rows.push({
        inventario_id: inv.id,
        nombre: prod.nombre,
        cantidad: prod.cantidad,
        costo_fi: prod.costoFI,
        precio_publico: prod.precioPublico,
        orden: idx,
      });
    });
  }
  return rows;
}

export function useInventarios() {
  const [inventarios, setInventarios] = useState<Inventario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isSeeding = useRef(false);

  const fetchInventarios = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('productos')
        .select('*')
        .order('orden', { ascending: true })
        .returns<ProductoRow[]>();

      if (fetchError) throw fetchError;

      if (!data || data.length === 0) {
        if (!isSeeding.current) {
          isSeeding.current = true;
          await seedInventarios();
          isSeeding.current = false;
          return fetchInventarios();
        }
      }

      setInventarios(rowsToInventarios(data || []));
      setError(null);
    } catch (err) {
      console.error('Error cargando inventarios:', err);
      setError('No se pudieron cargar los inventarios.');
      // Fallback a datos locales si Supabase falla
      setInventarios(inventariosData);
    } finally {
      setLoading(false);
    }
  }, []);

  const seedInventarios = async () => {
    const rows = inventariosToRows(inventariosData);
    const { error: seedError } = await supabase.from('productos').insert(rows);
    if (seedError) throw seedError;
  };

  // Carga inicial + realtime
  useEffect(() => {
    fetchInventarios();

    const channel = supabase
      .channel('productos-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'productos' },
        () => {
          fetchInventarios();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchInventarios]);

  const updateProducto = useCallback(
    async (inventarioId: string, productoIndex: number, updates: Partial<Producto>) => {
      const inv = inventarios.find(i => i.id === inventarioId);
      if (!inv) return;
      const producto = inv.productos[productoIndex];
      if (!producto) return;

      // Actualización optimista local
      setInventarios(prev =>
        prev.map(i => {
          if (i.id !== inventarioId) return i;
          const nuevosProductos = [...i.productos];
          nuevosProductos[productoIndex] = { ...nuevosProductos[productoIndex], ...updates };
          return { ...i, productos: nuevosProductos };
        })
      );

      // Persistir en Supabase
      const { error: updateError } = await supabase
        .from('productos')
        .update({
          cantidad: updates.cantidad ?? producto.cantidad,
          costo_fi: updates.costoFI ?? producto.costoFI,
          precio_publico: updates.precioPublico ?? producto.precioPublico,
        })
        .eq('inventario_id', inventarioId)
        .eq('nombre', producto.nombre);

      if (updateError) {
        console.error('Error actualizando producto:', updateError);
        // Revertir si falla
        fetchInventarios();
      }
    },
    [inventarios, fetchInventarios]
  );

  const updateCantidad = useCallback(
    (inventarioId: string, productoIndex: number, delta: number) => {
      const inv = inventarios.find(i => i.id === inventarioId);
      if (!inv) return;
      const nuevaCantidad = Math.max(0, inv.productos[productoIndex].cantidad + delta);
      updateProducto(inventarioId, productoIndex, { cantidad: nuevaCantidad });
    },
    [inventarios, updateProducto]
  );

  const setCantidad = useCallback(
    (inventarioId: string, productoIndex: number, cantidad: number) => {
      updateProducto(inventarioId, productoIndex, { cantidad: Math.max(0, cantidad) });
    },
    [updateProducto]
  );

  const updatePrecio = useCallback(
    (inventarioId: string, productoIndex: number, campo: 'costoFI' | 'precioPublico', valor: string) => {
      updateProducto(inventarioId, productoIndex, { [campo]: valor });
    },
    [updateProducto]
  );

  const getProductoByName = useCallback(
    (nombre: string): { producto: Producto; inventario: Inventario; index: number } | null => {
      for (const inv of inventarios) {
        const idx = inv.productos.findIndex(p =>
          p.nombre.toLowerCase().includes(nombre.toLowerCase())
        );
        if (idx !== -1) {
          return { producto: inv.productos[idx], inventario: inv, index: idx };
        }
      }
      return null;
    },
    [inventarios]
  );

  const buscarGlobal = useCallback(
    (query: string): { producto: Producto; inventario: Inventario; index: number }[] => {
      if (!query.trim()) return [];
      const results: { producto: Producto; inventario: Inventario; index: number }[] = [];
      for (const inv of inventarios) {
        inv.productos.forEach((prod, idx) => {
          if (prod.nombre.toLowerCase().includes(query.toLowerCase())) {
            results.push({ producto: prod, inventario: inv, index: idx });
          }
        });
      }
      return results;
    },
    [inventarios]
  );

  const resetInventarios = useCallback(async () => {
    try {
      setLoading(true);
      const { error: deleteError } = await supabase.from('productos').delete().neq('id', 0);
      if (deleteError) throw deleteError;

      await seedInventarios();
      await fetchInventarios();
    } catch (err) {
      console.error('Error restableciendo inventarios:', err);
      setError('No se pudieron restablecer los inventarios.');
      setInventarios(inventariosData);
    } finally {
      setLoading(false);
    }
  }, [fetchInventarios]);

  return {
    inventarios,
    loading,
    error,
    updateCantidad,
    setCantidad,
    updatePrecio,
    getProductoByName,
    buscarGlobal,
    resetInventarios,
  };
}
