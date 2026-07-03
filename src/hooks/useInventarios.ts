import { useState, useCallback } from 'react';
import { inventariosData, type Inventario, type Producto } from '@/data/inventarios';

export function useInventarios() {
  const [inventarios, setInventarios] = useState<Inventario[]>(() => {
    const saved = localStorage.getItem('farmasi_inventarios');
    return saved ? JSON.parse(saved) : inventariosData;
  });

  const persist = useCallback((data: Inventario[]) => {
    setInventarios(data);
    localStorage.setItem('farmasi_inventarios', JSON.stringify(data));
  }, []);

  const updateCantidad = useCallback((inventarioId: string, productoIndex: number, delta: number) => {
    setInventarios(prev => {
      const updated = prev.map(inv => {
        if (inv.id !== inventarioId) return inv;
        const nuevosProductos = [...inv.productos];
        const nuevaCantidad = Math.max(0, nuevosProductos[productoIndex].cantidad + delta);
        nuevosProductos[productoIndex] = {
          ...nuevosProductos[productoIndex],
          cantidad: nuevaCantidad,
        };
        return { ...inv, productos: nuevosProductos };
      });
      localStorage.setItem('farmasi_inventarios', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const setCantidad = useCallback((inventarioId: string, productoIndex: number, cantidad: number) => {
    setInventarios(prev => {
      const updated = prev.map(inv => {
        if (inv.id !== inventarioId) return inv;
        const nuevosProductos = [...inv.productos];
        nuevosProductos[productoIndex] = {
          ...nuevosProductos[productoIndex],
          cantidad: Math.max(0, cantidad),
        };
        return { ...inv, productos: nuevosProductos };
      });
      localStorage.setItem('farmasi_inventarios', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updatePrecio = useCallback((inventarioId: string, productoIndex: number, campo: 'costoFI' | 'precioPublico', valor: string) => {
    setInventarios(prev => {
      const updated = prev.map(inv => {
        if (inv.id !== inventarioId) return inv;
        const nuevosProductos = [...inv.productos];
        nuevosProductos[productoIndex] = {
          ...nuevosProductos[productoIndex],
          [campo]: valor,
        };
        return { ...inv, productos: nuevosProductos };
      });
      localStorage.setItem('farmasi_inventarios', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getProductoByName = useCallback((nombre: string): { producto: Producto; inventario: Inventario; index: number } | null => {
    for (const inv of inventarios) {
      const idx = inv.productos.findIndex(p => 
        p.nombre.toLowerCase().includes(nombre.toLowerCase())
      );
      if (idx !== -1) {
        return { producto: inv.productos[idx], inventario: inv, index: idx };
      }
    }
    return null;
  }, [inventarios]);

  const buscarGlobal = useCallback((query: string): { producto: Producto; inventario: Inventario; index: number }[] => {
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
  }, [inventarios]);

  const resetInventarios = useCallback(() => {
    persist(inventariosData);
  }, [persist]);

  return {
    inventarios,
    updateCantidad,
    setCantidad,
    updatePrecio,
    getProductoByName,
    buscarGlobal,
    resetInventarios,
  };
}
