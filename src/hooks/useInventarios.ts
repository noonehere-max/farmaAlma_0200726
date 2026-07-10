import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { inventariosData, type Inventario, type Producto } from '@/data/inventarios';
import type { HistorialEntry, HistorialCambio } from '@/hooks/useHistorial';

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

export function useInventarios(
  onLog?: (entry: Omit<HistorialEntry, 'id' | 'fecha' | 'usuario'>) => void
) {
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

  useEffect(() => {
    fetchInventarios();

    const channel = supabase
      .channel('productos-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'productos' }, () => {
        fetchInventarios();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchInventarios]);

  const log = useCallback(
    (entry: Omit<HistorialEntry, 'id' | 'fecha' | 'usuario'>) => {
      if (onLog) onLog(entry);
    },
    [onLog]
  );

  const updateProducto = useCallback(
    async (
      inventarioId: string,
      productoIndex: number,
      updates: Partial<Producto>,
      oldNombre?: string
    ) => {
      const inv = inventarios.find(i => i.id === inventarioId);
      if (!inv) return;
      const producto = inv.productos[productoIndex];
      if (!producto) return;

      const cambios: HistorialCambio[] = [];
      if (updates.cantidad !== undefined && updates.cantidad !== producto.cantidad) {
        cambios.push({ campo: 'cantidad', anterior: String(producto.cantidad), nuevo: String(updates.cantidad) });
      }
      if (updates.costoFI !== undefined && updates.costoFI !== producto.costoFI) {
        cambios.push({ campo: 'costo tienda', anterior: producto.costoFI, nuevo: updates.costoFI });
      }
      if (updates.precioPublico !== undefined && updates.precioPublico !== producto.precioPublico) {
        cambios.push({ campo: 'precio cliente', anterior: producto.precioPublico, nuevo: updates.precioPublico });
      }
      if (updates.nombre !== undefined && updates.nombre !== producto.nombre) {
        const nombreNormalizado = updates.nombre.trim().toLowerCase();
        const duplicado = inv.productos.some(
          (p, idx) => idx !== productoIndex && p.nombre.trim().toLowerCase() === nombreNormalizado
        );
        if (duplicado) {
          throw new Error(`Ya existe "${updates.nombre}" en ${inv.nombre}`);
        }
        cambios.push({ campo: 'nombre', anterior: producto.nombre, nuevo: updates.nombre });
      }

      setInventarios(prev =>
        prev.map(i => {
          if (i.id !== inventarioId) return i;
          const nuevosProductos = [...i.productos];
          nuevosProductos[productoIndex] = { ...nuevosProductos[productoIndex], ...updates };
          return { ...i, productos: nuevosProductos };
        })
      );

      const nombreWhere = oldNombre ?? producto.nombre;

      const { error: updateError } = await supabase
        .from('productos')
        .update({
          nombre: updates.nombre ?? producto.nombre,
          cantidad: updates.cantidad ?? producto.cantidad,
          costo_fi: updates.costoFI ?? producto.costoFI,
          precio_publico: updates.precioPublico ?? producto.precioPublico,
        })
        .eq('inventario_id', inventarioId)
        .eq('nombre', nombreWhere);

      if (updateError) {
        console.error('Error actualizando producto:', updateError);
        fetchInventarios();
      } else if (cambios.length > 0) {
        log({
          accion: 'editar',
          inventarioId,
          productoNombre: updates.nombre ?? producto.nombre,
          cambios,
        });
      }
    },
    [inventarios, fetchInventarios, log]
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

  const addProducto = useCallback(
    async (inventarioId: string, producto: Producto) => {
      const inv = inventarios.find(i => i.id === inventarioId);
      if (!inv) throw new Error('Catálogo no encontrado');

      const nombreNormalizado = producto.nombre.trim().toLowerCase();
      const duplicado = inv.productos.some(
        p => p.nombre.trim().toLowerCase() === nombreNormalizado
      );
      if (duplicado) {
        throw new Error(`Ya existe "${producto.nombre}" en ${inv.nombre}`);
      }

      const nextOrden = inv.productos.length;

      setInventarios(prev =>
        prev.map(i => (i.id === inventarioId ? { ...i, productos: [...i.productos, producto] } : i))
      );

      const { error: insertError } = await supabase.from('productos').insert({
        inventario_id: inventarioId,
        nombre: producto.nombre,
        cantidad: producto.cantidad,
        costo_fi: producto.costoFI,
        precio_publico: producto.precioPublico,
        orden: nextOrden,
      });

      if (insertError) {
        console.error('Error añadiendo producto:', insertError);
        fetchInventarios();
        throw new Error('No se pudo guardar el producto');
      }

      log({
        accion: 'crear',
        inventarioId,
        productoNombre: producto.nombre,
        cambios: [
          { campo: 'nombre', anterior: '', nuevo: producto.nombre },
          { campo: 'cantidad', anterior: '', nuevo: String(producto.cantidad) },
          { campo: 'costo tienda', anterior: '', nuevo: producto.costoFI },
          { campo: 'precio cliente', anterior: '', nuevo: producto.precioPublico },
        ],
      });
    },
    [inventarios, fetchInventarios, log]
  );

  const deleteProducto = useCallback(
    async (inventarioId: string, productoIndex: number) => {
      const inv = inventarios.find(i => i.id === inventarioId);
      if (!inv) return;
      const producto = inv.productos[productoIndex];
      if (!producto) return;

      setInventarios(prev =>
        prev.map(i =>
          i.id === inventarioId
            ? { ...i, productos: i.productos.filter((_, idx) => idx !== productoIndex) }
            : i
        )
      );

      const { error: deleteError } = await supabase
        .from('productos')
        .delete()
        .eq('inventario_id', inventarioId)
        .eq('nombre', producto.nombre);

      if (deleteError) {
        console.error('Error eliminando producto:', deleteError);
        fetchInventarios();
      } else {
        log({
          accion: 'eliminar',
          inventarioId,
          productoNombre: producto.nombre,
          cambios: [{ campo: 'eliminado', anterior: producto.nombre, nuevo: '' }],
        });
      }
    },
    [inventarios, fetchInventarios, log]
  );

  const moveProducto = useCallback(
    async (
      inventarioIdOrigen: string,
      productoIndex: number,
      inventarioIdDestino: string,
      updates?: Partial<Producto>
    ) => {
      if (inventarioIdOrigen === inventarioIdDestino) return;
      const origen = inventarios.find(i => i.id === inventarioIdOrigen);
      const destino = inventarios.find(i => i.id === inventarioIdDestino);
      if (!origen || !destino) return;

      const producto = origen.productos[productoIndex];
      if (!producto) return;

      const productoFinal = { ...producto, ...updates };

      const nombreNormalizado = productoFinal.nombre.trim().toLowerCase();
      const duplicado = destino.productos.some(
        p => p.nombre.trim().toLowerCase() === nombreNormalizado
      );
      if (duplicado) {
        throw new Error(`Ya existe "${productoFinal.nombre}" en ${destino.nombre}`);
      }

      setInventarios(prev =>
        prev.map(i => {
          if (i.id === inventarioIdOrigen) {
            return { ...i, productos: i.productos.filter((_, idx) => idx !== productoIndex) };
          }
          if (i.id === inventarioIdDestino) {
            return { ...i, productos: [...i.productos, productoFinal] };
          }
          return i;
        })
      );

      const nextOrden = destino.productos.length;

      // Mover en Supabase: eliminar de origen e insertar en destino
      const { error: deleteError } = await supabase
        .from('productos')
        .delete()
        .eq('inventario_id', inventarioIdOrigen)
        .eq('nombre', producto.nombre);

      if (deleteError) {
        console.error('Error moviendo producto (delete):', deleteError);
        fetchInventarios();
        throw new Error('No se pudo mover el producto');
      }

      const { error: insertError } = await supabase.from('productos').insert({
        inventario_id: inventarioIdDestino,
        nombre: productoFinal.nombre,
        cantidad: productoFinal.cantidad,
        costo_fi: productoFinal.costoFI,
        precio_publico: productoFinal.precioPublico,
        orden: nextOrden,
      });

      if (insertError) {
        console.error('Error moviendo producto (insert):', insertError);
        fetchInventarios();
        throw new Error('No se pudo mover el producto');
      }

      const cambios: HistorialCambio[] = [
        { campo: 'catálogo', anterior: origen.nombre, nuevo: destino.nombre },
      ];
      if (updates?.nombre !== undefined && updates.nombre !== producto.nombre) {
        cambios.push({ campo: 'nombre', anterior: producto.nombre, nuevo: updates.nombre });
      }
      if (updates?.cantidad !== undefined && updates.cantidad !== producto.cantidad) {
        cambios.push({ campo: 'cantidad', anterior: String(producto.cantidad), nuevo: String(updates.cantidad) });
      }
      if (updates?.costoFI !== undefined && updates.costoFI !== producto.costoFI) {
        cambios.push({ campo: 'costo tienda', anterior: producto.costoFI, nuevo: updates.costoFI });
      }
      if (updates?.precioPublico !== undefined && updates.precioPublico !== producto.precioPublico) {
        cambios.push({ campo: 'precio cliente', anterior: producto.precioPublico, nuevo: updates.precioPublico });
      }

      log({
        accion: 'mover',
        inventarioId: inventarioIdDestino,
        productoNombre: productoFinal.nombre,
        cambios,
      });
    },
    [inventarios, fetchInventarios, log]
  );

  const editProducto = useCallback(
    async (
      inventarioId: string,
      productoIndex: number,
      updates: Partial<Producto>,
      nuevoInventarioId?: string
    ) => {
      const inv = inventarios.find(i => i.id === inventarioId);
      const producto = inv?.productos[productoIndex];
      if (!producto) return;

      if (nuevoInventarioId && nuevoInventarioId !== inventarioId) {
        await moveProducto(inventarioId, productoIndex, nuevoInventarioId, updates);
        return;
      }
      await updateProducto(inventarioId, productoIndex, updates, producto.nombre);
    },
    [inventarios, moveProducto, updateProducto]
  );

  const getProductoByName = useCallback(
    (nombre: string): { producto: Producto; inventario: Inventario; index: number } | null => {
      for (const inv of inventarios) {
        const idx = inv.productos.findIndex(p => p.nombre.toLowerCase().includes(nombre.toLowerCase()));
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
    addProducto,
    editProducto,
    deleteProducto,
    moveProducto,
    getProductoByName,
    buscarGlobal,
    resetInventarios,
  };
}
